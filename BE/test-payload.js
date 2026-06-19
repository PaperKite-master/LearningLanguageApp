import axios from 'axios';

(async () => {
  try {
    const res = await axios.patch('http://localhost:4000/api/v1/admin/lessons/cb2ae152-1cf9-44f4-8e2c-334f1f7b1df6', {
      title: 'Test',
      vocabularies: [
        {
          hiragana: 'test_hira',
          romaji: 'test_romaji',
          kanji: 'test_kanji',
          meaning: 'test_meaning',
          questions: []
        }
      ]
    }, {
      headers: {
        // Need admin token to test actually
      }
    });
    console.log(res.data);
  } catch (e) {
    console.error(e.response?.data || e.message);
  }
})();
