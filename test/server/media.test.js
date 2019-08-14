'use strict';

const supertest = require('supertest');
const expect = require('chai').expect;

const agent = supertest.agent(require('../../index'));
const token = require('../../utils').token;

describe('Testing media-related APIs.', () => {
  let uploaded = null;

  it('Fetch media lists without token', async () => {
    const url = '/api/media/';
    const response = await agent.get(url).expect(403);

    expect(response.body.status).to.be.equal('error');
  });

  it('Fetch media lists with valid token', async () => {
    const url = `/api/media/?token=${token}`;
    const response = await agent.get(url).expect(200);

    expect(response.body.status).to.be.ok;
  });

  it('Upload file without token', async () => {
    const url = '/api/media/cpuinfo';
    const response = await agent.put(url)
      .attach('file', Buffer.from('hello world'), 'sample.txt')
      .expect(403);

    expect(response.body.status).to.be.equal('error');
  });

  it('Upload file with valid token', async () => {
    const url = `/api/media/cpuinfo.txt?token=${token}`;
    const response = await agent.put(url)
      .attach('file', Buffer.from('hello world'), 'sample.txt')
      .expect(200);

    expect(response.body.status).to.be.ok;

    uploaded = response.body.filename;
  });

  it('Delete file without token', async () => {
    const url = `/api/media/${uploaded}`;
    const response = await agent.delete(url)
      .expect(403);

    expect(response.body.status).to.be.equal('error');
  });

  it('Delete file with valid token', async () => {
    const url = `/api/media/${uploaded}?token=${token}`;
    const response = await agent.delete(url).expect(200);

    expect(response.body.status).to.be.ok;
  });
});
