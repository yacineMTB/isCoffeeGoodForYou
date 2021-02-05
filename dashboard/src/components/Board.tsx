import React from 'react';

type BoardCountProps = {
  numberOfPornographicImages: number,
  boardName: string
}
function BoardCount({numberOfPornographicImages, boardName}: BoardCountProps) {
  return <p>We have detected {numberOfPornographicImages} pornographic images on {boardName}</p>;
}

export default BoardCount;
