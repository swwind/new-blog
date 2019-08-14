import axios from 'axios';
import config from '../config.json';

function fetchLatestReplies () {
  return new Promise((resolve, reject) => {
    axios.get(`${config.api.url}/reply/latest`)
      .then(response => resolve(response.data.replies))
      .catch(error => reject(error));
  });
}

export default {
  fetchLatestReplies
};
