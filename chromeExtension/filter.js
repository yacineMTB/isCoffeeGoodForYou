let imgs = document.querySelectorAll('img');
console.log(imgs);
for (imgElt of imgs) {
  console.log(imgElt)
  let url = 'https://s.4cdn.org/image/spoiler-a1.png';
  imgElt.src = url;
}