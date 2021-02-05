const URL = 'http://localhost:39591/';
const spoilerImageUrl = 'https://s.4cdn.org/image/spoiler-a1.png';

// This is a lazy solution to make sure we're not doing redundanttt requests
const lazyCache = new Set();

const processOne = async ({ md5, imgElt }) => {
  const res = await fetch(`${URL}${encodeURIComponent(md5)}`);
  const {
    sexy, neutral, porn, drawing, hentai,
  } = await res.json();
  const pornFloat = parseFloat(porn);
  const hentaiFloat = parseFloat(hentai);
  const sexyFloat = parseFloat(sexy);
  // const neutralFloat = parseFloat(neutral);
  // const drawingFloat = parseFloat(drawing);
  const threeDimensionalPigDisgusting = sexyFloat + pornFloat > 0.35;
  const twoDimensionalPigDisgusting = hentaiFloat > 0.40;
  console.log(twoDimensionalPigDisgusting);
  if (threeDimensionalPigDisgusting || twoDimensionalPigDisgusting) {
    imgElt.src = spoilerImageUrl;
  }
};

const observer = new MutationObserver(async () => {
  const images = document.getElementsByTagName('img');
  for (const imgElt of images) {
    const md5 = imgElt.getAttribute('data-md5');
    if (md5 && !lazyCache.has(md5)) {
      processOne({ md5, imgElt });
      lazyCache.add(md5);
    }
  }
});
observer.observe(document, { childList: true, subtree: true });
