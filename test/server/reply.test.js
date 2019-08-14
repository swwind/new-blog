'use strict';

const supertest = require('supertest');
const expect = require('chai').expect;

const agent = supertest.agent(require('../../index'));

describe('Testing reply-related APIs.', () => {
  it('Fetch latest replies', async () => {
    const url = '/api/reply/latest';
    const response = await agent.get(url).expect(200);

    expect(response.body.status).to.be.ok;
    expect(response.body.replies).not.to.be.undefined;
  });
});
