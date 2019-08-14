'use strict';

const supertest = require('supertest');
const expect = require('chai').expect;

const agent = supertest.agent(require('../../index'));
const token = require('../../utils').token;

describe('Testing widget-related APIs.', () => {
  const widgetTemplate = {
    title: 'Hello World',
    content: 'Hello World',
    enabled: true
  };
  let widgets;
  let id;

  it('Fetch enabled widget list', async () => {
    const url = '/api/widget';
    const response = await agent.get(url).expect(200);

    expect(response.body.status).to.be.ok;
    expect(response.body.widgets).not.to.be.undefined;

    widgets = response.body.widgets;
  });

  it('Fetch all widget list', async () => {
    const url = '/api/widget/all';
    const response = await agent.get(url).expect(200);

    expect(response.body.status).to.be.ok;
    expect(response.body.widgets).not.to.be.undefined;
    expect(response.body.widgets.length).not.to.lessThan(widgets.length);

    widgets = response.body.widgets;
  });

  it('Create new widget without token', async () => {
    const url = '/api/widget';
    const response = await agent.put(url).send(widgetTemplate).expect(403);

    expect(response.body.status).to.be.equal('error');
  });

  it('Create new widget', async () => {
    const url = `/api/widget?token=${token}`;
    const response = await agent.put(url).send(widgetTemplate).expect(200);

    expect(response.body.status).to.be.ok;
    expect(response.body._id).not.to.be.undefined;
    id = response.body._id;
  });

  it('Check if widget is added', async () => {
    const url = '/api/widget/all';
    const response = await agent.get(url).expect(200);

    expect(response.body.status).to.be.ok;
    expect(response.body.widgets).not.to.be.undefined;
    expect(response.body.widgets.length).to.be.greaterThan(widgets.length);
  });

  it('Update the new widget without token', async () => {
    widgetTemplate.enabled = false;

    const url = `/api/widget/${id}`;
    const response = await agent.post(url).send(widgetTemplate).expect(403);

    expect(response.body.status).to.be.equal('error');
  });

  it('Update the new widget', async () => {
    widgetTemplate.enabled = false;

    const url = `/api/widget/${id}?token=${token}`;
    const response = await agent.post(url).send(widgetTemplate).expect(200);

    expect(response.body.status).to.be.ok;
  });

  it('Update a widget with invalid id', async () => {
    const url = `/api/widget/123123?token=${token}`;
    const response = await agent.post(url).send(widgetTemplate).expect(500);

    expect(response.body.status).equal('error');
  });

  it('Delete the new widget without token', async () => {
    const url = `/api/widget/${id}`;
    const response = await agent.delete(url).expect(403);

    expect(response.body.status).to.be.equal('error');
  });

  it('Delete the new widget', async () => {
    const url = `/api/widget/${id}?token=${token}`;
    const response = await agent.delete(url).expect(200);

    expect(response.body.status).to.be.ok;
    id = null;
  });

  it('Delete a widget with invalid id', async () => {
    const url = `/api/widget/123123?token=${token}`;
    const response = await agent.delete(url).expect(500);

    expect(response.body.status).equal('error');
  });
});
