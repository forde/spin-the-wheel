import Two from 'two.js';

const PI = Math.PI;
const TAU = PI * 2;

const degToRad = (deg) =>
  deg / 180 * PI;

const getCoordOnCircle = (r, angleInRad, { cx, cy }) => {
  return {
    x: cx + r * Math.cos(angleInRad),
    y: cy + r * Math.sin(angleInRad),
  };
};

const wheelFactory = (mountElem) => {
  if (!mountElem || !('nodeType' in mountElem)) {
    throw new Error('no mount element provided');
  }

  const eventMap = {
    //mousedown: handleCursorDown,
    //touchstart: handleCursorDown,
    //mousemove: handleCursorMove,
    //touchmove: handleCursorMove,
    //mouseup: handleCursorUp,
    //touchend: handleCursorUp,
  }; 
  const ratios = {
    tickerRadius: .06, // of width
    textSize: .12, // of radius
    edgeDist: .14, // of radius
  };
  let options = {
    width: 360,
    height: 360,
    type: 'svg',
    colors: ['#f7d046','#034347','#096241','#46AA75','#9EC85E','#EFB240','#DA582F','#CF1C3A','#8C1B4D','#56124C'],
  };
  const friction = .996;
  //const maxSpeed = .5;
  //let isGroupActive = false;
  //let textDistFromEdge = 75;
  //let curPosArr = [];
  let dirScalar = 1;
  //let lastCurTime;
  let speed;
  let words;
  let two;
  let group;

  function init(opts) {
    options = Object.assign({}, options, opts);
    two = new Two({
      type: Two.Types[options.type],
      width: options.width,
      height: options.height,
    }).bind('resize', handleResize).play();
    
    initEvents();
    two.appendTo(mountElem);
    setViewBox(options.width, options.height);

    two.renderer.domElement.setAttribute(
      'style',
      `
        -moz-user-select:none;
        -ms-user-select:none;
        -webkit-user-select:none;
        user-select:none;
        -webkit-tap-highlight-color: rgba(0,0,0,0);
      `
    );
  }

  function setWords(wordsArr) {
    words = wordsArr;
  }

  function setViewBox(width, height) {
    two.renderer.domElement.setAttribute(
      'viewBox',
      `0 0 ${width} ${height}`
    );
  }

  function drawTicker() {
    const { width } = two;
    const outerRadius = ratios.tickerRadius * width - 10;

    drawTickerArrow(outerRadius, degToRad(25), {x: width / 2, y: outerRadius});
  }

  function drawTickerArrow(radius, tangentAngle, tickerCenter) {
    const { x, y } = tickerCenter;

    const pointA = getCoordOnCircle(
      radius, PI / 2, { cx: x, cy: y}
    );
    const pointB = getCoordOnCircle(
      radius, tangentAngle, { cx: x, cy: y}
    );
    const pointC = {
      x: x,
      y: y + radius / Math.cos(PI / 2 - tangentAngle),
    };
    const pointD = getCoordOnCircle(
      radius, PI - tangentAngle, { cx: x, cy: y}
    );
    const path = two.makePath(
      pointA.x, pointA.y,
      pointB.x, pointB.y,
      pointC.x, pointC.y,
      pointD.x, pointD.y
    );
    path.fill = '#27303D';
    path.noStroke();

    return path;
  }

  function drawWheel() {
    if (group) { destroyPaths();}

    const { width, height } = two;
    const numColors = options.colors.length;
    const rotationUnit = 2 * PI / words.length;
    const yOffset = width * ratios.tickerRadius * 2;
    const radius = (width - yOffset) / 2;
    const center = {
      x: width / 2,
      y: radius + yOffset,
    };
    group = two.makeGroup();

    words.map((word, i, arr) => {
      const angle = rotationUnit * i - (PI + rotationUnit) / 2;
      const arc = two.makeArcSegment(
        center.x, center.y,
        0, radius,
        0, 2 * PI / arr.length
      );
      arc.rotation = angle;
      arc.noStroke();
      //arc.stroke = '#313946';
      //arc.linewidth = 2;
      arc.fill = options.colors[i % numColors];

      const textVertex = {
        x: center.x + (radius - radius * ratios.edgeDist) * Math.cos(angle + rotationUnit / 2),
        y: center.y + (radius - radius * ratios.edgeDist) * Math.sin(angle + rotationUnit / 2),
      };

      const text = two.makeText(word, textVertex.x, textVertex.y);
      text.rotation = rotationUnit * i + PI / 2;
      text.alignment = 'left';
      text.fill = '#fff';
      text.size = 30;//radius * ratios.textSize;

      group.add(arc, text);
      return word;
    });

    group.translation.set(center.x, center.y);
    group.center();
    drawTicker();

    two.update();
  }

  function handleResize() {
    setViewBox(two.width, two.height);
    drawWheel();
    drawTicker();
    two.update();
  }

  /*function handleCursorDown(e) {
    const event = getEvent(e);
    const groupElem = group._renderer.elem;
    isGroupActive = groupElem === e.target || groupElem.contains(e.target);
    curPosArr = isGroupActive ? curPosArr.concat(getEventPos(e)) : curPosArr;
    lastCurTime = performance.now();
  }

  function handleCursorMove(e) {
    if (isGroupActive && curPosArr.length) {
      e.preventDefault();
      lastCurTime = performance.now();
      curPosArr = curPosArr.concat(getEventPos(e));
      const currPos = curPosArr[curPosArr.length - 1];
      const prevPos = curPosArr[curPosArr.length - 2];
      const groupBounds = group._renderer.elem.getBoundingClientRect();
      const groupCenter = {
        x: groupBounds.left + groupBounds.width / 2,
        y: groupBounds.top + groupBounds.height / 2,
      };
      const angleAtCursorDown = Math.atan2(
        prevPos.y - groupCenter.y,
        prevPos.x - groupCenter.x
      );
      const angleAtCursorNow = Math.atan2(
        currPos.y - groupCenter.y,
        currPos.x - groupCenter.x
      );
      const deltaRotation = angleAtCursorNow - angleAtCursorDown;
      dirScalar = deltaRotation > 0 ? 1 : -1;

      group.rotation = (group.rotation + deltaRotation) % TAU;
      
      handleRotationChange(group.rotation);

      two.update();
    }
  }*/

  /*function handleCursorUp(e) {
    if (isGroupActive && curPosArr.length > 1) {
      const currPos = getEventPos(e);
      const lastPos = curPosArr[curPosArr.length - 2];
      const timeNow = performance.now();
      const time = timeNow - lastCurTime;
      const distance = Math.sqrt(
        Math.pow(currPos.x - lastPos.x, 2) + 
        Math.pow(currPos.y - lastPos.y, 2)
      );
      speed = Math.min(distance / time, maxSpeed);

      two.bind('update', animateWheel);
    }
    
    curPosArr = [];
    isGroupActive = false;
  }*/

  /*function getEventPos(e) {
    const event = getEvent(e);

    return {
      x: event.clientX,
      y: event.clientY,
    };
  }*/

  /*function getEvent(e) {
    return e.changedTouches ? e.changedTouches[0] : e;
  }*/

  function animateWheel() {
    group.rotation = (group.rotation + speed * dirScalar) % TAU;
    speed = speed * friction;

    handleRotationChange(group.rotation);

    if (speed < 0.001) {
      two.unbind('update', animateWheel);
      if (options.onEnd && typeof options.onEnd === 'function') {
        options.onEnd(getCurrentWord());
      }
    }
  }

  function handleRotationChange(angle) {
    if (options.onWheelTick && typeof options.onWheelTick === 'function') {
      options.onWheelTick(angle);
    }
  }
  
  function spin(newSpeed) {
    speed = newSpeed;
    two.bind('update', animateWheel);
  }

  function updateDims({ height, width }) {
    two.width = parseInt(width, 10);
    two.height = parseInt(height, 10);
    two.trigger('resize');
  }
  
  function getCurrentWord() {
    const numWords = words.length;
    const segmentAngle = TAU / numWords;
    const currAngle = (TAU - group.rotation + segmentAngle / 2) % TAU;
    
    return words.find((_, i) => segmentAngle * (i + 1) > currAngle);
  }

  function initEvents() {
    const domElement = two.renderer.domElement;

    Object.keys(eventMap).map(type =>
      domElement.addEventListener(type, eventMap[type])
    );
  }

  function removeEvents() {
    const domElement = two.renderer.domElement;

    two.unbind('update');
    
    Object.keys(eventMap).map(type =>
      domElement.removeEventListener(type, eventMap[type])
    );
  }

  function destroyPaths() {
    group.remove.apply(group, group.children);
    two.clear();
  }

  function destroy() {
    destroyPaths();
    removeEvents();
    mountElem.innerHTML = '';
    return true;
  }

  return {
    destroy,
    drawWheel,
    getCurrentWord,
    init,
    setWords,
    spin,
    updateDims,
  };
};

export default wheelFactory;