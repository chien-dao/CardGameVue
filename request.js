import axios from 'axios';
import { AsyncStorage } from 'react-native';

const httpRequest = axios.create({
  baseURL: 'https://deckofcardsapi.com/api/deck',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
});

httpRequest.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers['Access-Token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

function request(options) {
  return httpRequest(options)
    .then((response) => {
      if (response.status >= 200 && response.status < 305) {
        return response.data;
      }

      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    });
}

export default request;