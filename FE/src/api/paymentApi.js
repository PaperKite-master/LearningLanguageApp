import axiosClient from './axiosClient';

const paymentApi = {
  createVnpayUrl(data) {
    return axiosClient.post('/payment/create-url', data);
  },
  
  createMomoUrl(data) {
    return axiosClient.post('/payment/create-momo-url', data);
  },

  createPayOsUrl(data) {
    return axiosClient.post('/payment/create-payos-url', data);
  },

  verifyTransaction(orderId) {
    return axiosClient.get(`/payment/verify-transaction?orderId=${orderId}`);
  }
};

export default paymentApi;
