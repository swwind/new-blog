'use strict';

const supertest = require('supertest');
const config = require('../../config');

const agent = supertest.agent(require('../../index'));

describe('Testing index-rendering with SSR', async () => {
  it('Render index', async () => {
    const url = '/';
    await agent.get(url).expect(200);
  });

  it('Render tag view', async () => {
    // Fetch all tags first
    const tags = (await agent.get('/api/tag').expect(200)).body.tags;

    const url = `/tag/${tags[0].tag}`;
    await agent.get(url).expect(200);
  });

  it('Render category view', async () => {
    // Fetch all categories first
    const categories = (await agent.get('/api/category').expect(200)).body.categories;

    const url = `/category/${encodeURIComponent(categories[0])}`;
    await agent.get(url).expect(200);
  });

  it('Get favicon.ico', async () => {
    const url = '/favicon.ico';
    await agent.get(url).expect(config.favicon === null ? 404 : 200);
  });

  it('Get a page that doesnt exist', async () => {
    const url = '/blablaemm';
    await agent.get(url).expect(302).expect('Location', '/not-found');
  });

  it('Render 404 page', async () => {
    const url = '/not-found';
    await agent.get(url).expect(404);
  });

  it('Render RSS feeds', async () => {
    if (!config.plugins['rss-feed'].enabled) {
      return;
    }
    await agent.get('/feeds').expect(200);
  });

  it('Render Gallery', async () => {
    if (!config.plugins.gallery.enabled) {
      return;
    }
    await agent.get(config.plugins.gallery.mountPoint).expect(200);
  });
});
