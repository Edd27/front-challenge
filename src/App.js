import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import trashIcon from "./assets/trash.svg";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  /**
   * Add a new moveable component to the list of moveable components
   */
  const addMoveable = () => {
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
      },
    ]);
  };

  /**
   *
   * @param {number} id
   * @param {{
   * id: number
   * top: number
   * left: number
   * width: number
   * height: number
   * color: string
   * updateEnd: boolean
   * }} newComponent
   * @param {boolean} updateEnd
   *
   * Update the moveable component with the given id
   */
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  /**
   *
   * @param {number} index
   * @param {Event} e
   *
   * Handle the resize start event
   */
  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  /**
   *
   * @param {number} id
   *
   * Remove the moveable component with the given id
   */
  const handleRemoveComponent = (id) => {
    setMoveableComponents(moveableComponents.filter((el) => el.id !== id));
  };

  return (
    <main className="main">
      <div className="container">
        <h1 className="title">React Moveable</h1>
        <div className="header">
          <button onClick={addMoveable} className="add-button">
            <span>Add moveable</span>
          </button>
        </div>
        <div id="parent" className="parent">
          {moveableComponents.map((item, index) => (
            <Component
              {...item}
              key={index}
              updateMoveable={updateMoveable}
              handleResizeStart={handleResizeStart}
              setSelected={setSelected}
              isSelected={selected === item.id}
              handleRemoveComponent={handleRemoveComponent}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default App;

const OBJECT_FIT_OPTIONS = ["fill", "contain", "cover", "scale-down"];

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  handleRemoveComponent,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  const [image, setImage] = useState(null);
  const [imageFit, setImageFit] = useState("fill");

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  /**
   *
   * @param {Event} e
   *
   * Handle the resize event
   */
  const onResize = async (e) => {
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  /**
   *
   * @param {Event} e
   *
   * Handle the resize end event
   */
  const onResizeEnd = async (e) => {
    const { lastEvent } = e;

    if (lastEvent) {
      if (lastEvent.drag) {
        const { drag } = lastEvent;
        const { beforeTranslate } = drag;

        let newWidth = lastEvent.width || 0;
        let newHeight = lastEvent.height || 0;

        const positionMaxTop = top + newHeight;
        const positionMaxLeft = left + newWidth;

        if (positionMaxTop > parentBounds?.height)
          newHeight = parentBounds?.height - top;
        if (positionMaxLeft > parentBounds?.width)
          newWidth = parentBounds?.width - left;

        const absoluteTop = top + beforeTranslate[1] < 0 ? 0 : top;
        const absoluteLeft = left + beforeTranslate[0] < 0 ? 0 : left;

        updateMoveable(
          id,
          {
            top: absoluteTop,
            left: absoluteLeft,
            width: newWidth,
            height: newHeight,
            color,
          },
          true
        );
      }
    }
  };

  /**
   * Fetch a random image from the JSONPlaceholder API
   */
  const fetchImage = async () => {
    const randId = Math.floor(Math.random() * 5000);
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/photos/${randId}`
    );
    const data = await response.json();
    setImage(data);
  };

  /**
   * Initialize the image and the image fit to a component
   */
  useEffect(() => {
    fetchImage();
    setImageFit(
      OBJECT_FIT_OPTIONS[Math.floor(Math.random() * OBJECT_FIT_OPTIONS.length)]
    );
  }, []);

  return (
    <>
      <div
        ref={ref}
        className="draggable moveable-component"
        id={"component-" + id}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          objectFit: imageFit,
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
          overflow: "hidden",
          borderRadius: "10px",
        }}
        onClick={() => setSelected(id)}
      >
        {image && (
          <img
            src={image.url}
            alt={image.title || "image"}
            style={{
              position: "relative",
              margin: "0",
              width: "100%",
              height: "100%",
              objectFit: imageFit,
            }}
          />
        )}
        <button
          className="delete-button"
          onClick={() => handleRemoveComponent(id)}
        >
          <img
            src={trashIcon}
            alt="Delete"
            style={{
              width: "20px",
              height: "20px",
            }}
          />
        </button>
      </div>
      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
