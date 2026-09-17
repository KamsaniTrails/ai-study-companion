const EventEmitter = require('events');
const crypto = require('crypto');

class BackgroundQueueService extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
    this.processingQueue = [];
    this.concurrency = 2;
    this.activeCount = 0;
    this.handlers = new Map();
  }

  registerHandler(type, handler) {
    this.handlers.set(type, handler);
  }

  enqueue(type, data, jobId, maxRetries = 2) {
    const id = jobId || `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    // if job is already queued or running don't create it again
    if (this.jobs.has(id)) {
      const existing = this.jobs.get(id);
      if (existing.status === 'queued' || existing.status === 'processing') {
        return existing;
      }
    }
    // job details
    const job = {
      id,
      type,
      data,
      status: 'queued',
      progress: 0,
      stage: 'queued',
      attempts: 0,
      maxRetries,
      createdAt: new Date().toISOString()
    };

    this.jobs.set(id, job);
    this.processingQueue.push(id);
    this.emit('job_queued', job);

    setTimeout(() => this.processNext(), 50);
    return job;
  }

  getJob(id) {
    return this.jobs.get(id);
  }

  getAllJobs() {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  updateJobProgress(id, progress, stage) {
    const job = this.jobs.get(id);
    if (job) {
      job.progress = Math.min(100, Math.max(0, progress));
      job.stage = stage;
      this.emit('job_progress', job);
    }
  }
  //process next job
  async processNext() {
    if (this.activeCount >= this.concurrency || this.processingQueue.length === 0) {
      return;
    }
    // grab next job
    const jobId = this.processingQueue.shift();
    if (!jobId) return;

    const job = this.jobs.get(jobId);
    if (!job || job.status === 'completed') return;

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = 'failed';
      job.error = `No handler for ${job.type}`;
      this.emit('job_failed', job);
      return;
    }

    this.activeCount++;
    job.status = 'processing';
    job.startedAt = new Date().toISOString();
    job.attempts++;
    this.emit('job_started', job);

    try {
      const result = await handler(job);
      //mark completed
      job.status = 'completed';
      job.progress = 100;
      job.stage = 'completed';
      job.result = result;
      job.completedAt = new Date().toISOString();
      this.emit('job_completed', job);
    } catch (err) {
      if (job.attempts < job.maxRetries) {
        job.status = 'queued';
        job.stage = `retry_${job.attempts + 1}`;
        setTimeout(() => {
          this.processingQueue.push(job.id);
          this.processNext();
        }, 1200 * job.attempts);
      } else {
        job.status = 'failed';
        job.error = err.message || 'Processing failed';
        job.completedAt = new Date().toISOString();
        this.emit('job_failed', job);
      }
    } finally {
      this.activeCount--;
      this.processNext();
    }
  }


  retryJob(id) {
    const job = this.jobs.get(id);
    if (!job) return null;
    job.status = 'queued';
    job.stage = 'retry_manual';
    job.progress = 0;
    job.attempts = 0;
    job.error = null;
    this.processingQueue.push(job.id);
    setTimeout(() => this.processNext(), 50);
    return job;
  }
  getQueueStats() {
    let queued = 0, processing = 0, completed = 0, failed = 0;
    for (const j of this.jobs.values()) {
      if (j.status === 'queued') queued++;
      else if (j.status === 'processing') processing++;
      else if (j.status === 'completed') completed++;
      else if (j.status === 'failed') failed++;
    }
    return { queued, processing, completed, failed, total: this.jobs.size };
  }
}

const backgroundQueue = new BackgroundQueueService();
module.exports = { backgroundQueue };
