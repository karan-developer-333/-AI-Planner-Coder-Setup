import axios  from 'axios';

async function findImages(query) {
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://google.serper.dev/images',
      headers: { 
        'X-API-KEY': process.env.SERPER_API_KEY, 
        'Content-Type': 'application/json'
      },
      data : JSON.stringify({
        "q": query,
        "gl": "in"
      })
    };
  try {
    const response = await axios.request(config);
    const filtredData = response.data.images.map(e=>{
        return {title:e.title,imageUrl:e.imageUrl}
    })
    console.log(JSON.stringify(filtredData));
  }
  catch (error) {
    console.log(error);
  }
}

export {
    findImages
}