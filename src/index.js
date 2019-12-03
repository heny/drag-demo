// 
function queryDom(params) {
  return document.querySelector(params)
}

function creatSelectDom(params) {
  // let domWrap = document.createElement('div')
  // domWrap.className = 'select'
  let domWrap = queryDom('#cloneDom').firstElementChild.cloneNode(true)
  return domWrap
}
// 返回选择框的坐标，宽高尺寸信息
function getSelectMess(parentDom) {
  return '---'
}
// 选择区域的坐标，宽高尺寸信息

// 计算是否超出边界（左右）
function clacBoundary(curDom, parentDom, domWidth, domHeight) {
  // 当前元素的坐标位置（相对于父元素）
  let curDomeLeft = curDom.offsetLeft
  let curDonTop = curDom.offsetTop
  // let curDomWidth = curDom.clientWidth
  // let curDomHeight = curDom.clientHeight
  let parentDomWidth = parentDom.clientWidth
  let parentDomHeight = parentDom.clientHeight

  let domWidths = (curDomeLeft + domWidth >= parentDomWidth) ? parentDomWidth - curDomeLeft : domWidth
  let domHeights = (curDonTop + domHeight >= parentDomHeight) ? parentDomHeight - curDonTop : domHeight
  domWidths = domWidths < 0 ? 0 : domWidths
  domHeights = domHeights < 0 ? 0 : domHeights
  return { domWidths, domHeights }
}

function createArea(dom) {
  // 目标对象（要生成可选区域的dom，如img）
  let tarDom = queryDom(dom)
  let selectedArea = {}
  tarDom.onmousedown = function (e) {
    // e.stopPropagation()
    console.log('按下。。。')
    console.log(e)
    // 禁止在已生成选择区的地方再次生成选择区
    if (e.target.getAttribute('data-select') === 'yes' || e.target.className.indexOf('dot') > -1) {
      console.log('禁区，不可添加选择框！')
      return
    }
    // 起点(相对tarDom的坐标)
    selectedArea.left = e.clientX - tarDom.offsetLeft
    selectedArea.top = e.clientY - tarDom.offsetTop
    // 生成dom插入
    let selectArea = creatSelectDom()
    selectArea.style.left = selectedArea.left + 'px'
    selectArea.style.top = selectedArea.top + 'px'
    tarDom.onmousemove = function (e) {
      tarDom.appendChild(selectArea)
      console.log('移动')
      // console.log(e.offsetX, e.offsetY)
      // 鼠标在tarDom的坐标
      let diffX = e.clientX - tarDom.offsetLeft
      let diffY = e.clientY - tarDom.offsetTop
      // 鼠标移动的距离即宽高
      let domWidth = diffX - selectedArea.left
      let domHeight = diffY - selectedArea.top
      console.log('拉伸宽高：' + domWidth, domHeight)

      //考虑 逆向拉伸
      if (domWidth < 0) {
        // domWidth = 0
        domWidth = Math.abs(domWidth)
        selectedArea.left = selectedArea.left - domWidth
        selectedArea.left = selectedArea.left < 0 ? 0 : selectedArea.left
        selectArea.style.left = selectedArea.left + 'px'
      }
      if (domHeight < 0) {
        domHeight = Math.abs(domHeight)
        selectedArea.top = selectedArea.top - domHeight
        selectedArea.top = selectedArea.top < 0 ? 0 : selectedArea.top
        selectArea.style.top = selectedArea.top + 'px'
      }
      // 添加限制边界
      let { domWidths, domHeights } = clacBoundary(selectArea, tarDom, domWidth, domHeight)

      selectArea.style.width = domWidths + 'px'
      selectArea.style.height = domHeights + 'px'
      console.log('计算后的拉伸宽高：' + domWidths, domHeights)
      // 返回插入选择区的信息
      Object.assign(selectedArea, { domWidth, domHeight })

    }
    tarDom.onmouseup = function (e) {
      console.log('抬起。。。')
      console.log(selectedArea)
      tarDom.onmousemove = null
      tarDom.onmouseup = null
      // 生成的选择框可拖拽
      selectAreaMove(selectArea, tarDom)
    }
  }
}

// 区域可拖拽移动
/**
 * @params dragDom--拖拽的dom（选择框），parentDom--所在的基准父元素
 * 
 *  */
function selectAreaMove(dragDom, parentDom) {
  // dragDom.onmousemove = null
  document.oncontextmenu = function (e) {
    e.preventDefault()
  }
  dragDom.onmousedown = function (ev) {
    let e = ev || window.event
    // e.stopPropagation()
    // 鼠标在可拉伸的点上时，不可移动区域
    let curMouseDom = e.target || e.srcElement
    if (curMouseDom.className.indexOf('dot') > -1) {
      // 不可拖拽
      console.log('dot')
      // 给选择区域初始化绑定拉伸事件(事件代理方式)
      selectAreaResize(e, dragDom, parentDom)
      return
    } else if(e.button === 2) {
      console.log('you');
      addRightMenu(dragDom)
    }
    console.log('开始drag')
    // 记录拖拽的起始坐标点（鼠标相对于拖拽select）
    let dragStartX = e.clientX - dragDom.offsetLeft
    let dragStartY = e.clientY - dragDom.offsetTop
    // 开始拖拽
    document.onmousemove = function (e) {
      console.log(e)
      // e.stopPropagation()
      let dragDomLeft = e.clientX - dragStartX
      let dragDomTop = e.clientY - dragStartY
      console.log('拖拽元素的坐标：' + dragDomLeft, dragDomTop)

      let dragDomWidth = dragDom.clientWidth
      // debugger
      let dragDomHeight = dragDom.clientHeight
      let parentDomWidth = parentDom.clientWidth
      let parentDomHeight = parentDom.clientHeight
      // 添加拖拽的左右边界
      dragDomLeft = dragDomLeft < 0 ? 0 : dragDomLeft
      dragDomLeft = (dragDomLeft + dragDomWidth >= parentDomWidth) ? parentDomWidth - dragDomWidth : dragDomLeft
      // 添加拖拽的上下边界
      dragDomTop = dragDomTop < 0 ? 0 : dragDomTop
      dragDomTop = (dragDomTop + dragDomHeight >= parentDomHeight) ? parentDomHeight - dragDomHeight : dragDomTop

      console.log('拖拽元素的坐标（计算后）：' + dragDomLeft, dragDomTop)
      dragDom.style.left = dragDomLeft + 'px'
      dragDom.style.top = dragDomTop + 'px'
    }
    document.onmouseup = function (params) {
      console.log('stop drag')
      document.onmousemove = null
      document.onmouseup = null
    }
  }
}

// 区域可拉伸
/**
 * @params resizeDom--拉伸的dom（选择框），parentDom--所在的基准父元素
 *  */
function selectAreaResize(e, resizeDom, parentDom) {
  // let e = ev || window.event
  let tarDot = e.srcElement || e.target
  // if (tarDot.className.indexOf('dot') > -1) {
  // 可以拉伸
  console.log('可以拉伸了。。')
  if (tarDot.className.indexOf('moveX') > -1) {
    startResizeX(e, resizeDom, parentDom)
  } else if (tarDot.className.indexOf('moveY') > -1) {
    startResizeY(e, resizeDom, parentDom)
  } else if (tarDot.className.indexOf('move-XY') > -1) {
    startResizeXY(e, resizeDom, parentDom)
  }

  // }
}
// x方向拉伸
function startResizeX(e, resizeDom, parentDom) {
  let tarDot = e.srcElement || e.target
  let x = e.clientX // 鼠标按下的坐标x
  let resizeDomW = resizeDom.offsetWidth
  let resizeDomL = resizeDom.offsetLeft
  document.onmousemove = e => {
    console.log('拉伸移动距离：' + (e.clientX - x))
    let resizeDomWidth
    let resizeDomLeft
    // x轴左侧dot的拉伸

    resizeDomWidth = resizeXLeft(tarDot, e, x, resizeDom, resizeDomLeft, resizeDomL, resizeDomWidth, resizeDomW)
    // 添加限制边界（右）
    let { domWidths } = clacBoundary(resizeDom, parentDom, resizeDomWidth, 0)
    console.log('拉伸x方向left，width：' + resizeDomLeft, domWidths)

    resizeDom.style.width = domWidths + 'px'
  }
  document.onmouseup = () => [document.onmousemove, document.onmouseup] = [null, null]
  e.preventDefault && e.preventDefault()
}
// y轴dot的拉伸
function startResizeY(e, resizeDom, parentDom) {
  let tarDot = e.srcElement || e.target
  let y = e.clientY;
  let resizeDomH = resizeDom.offsetHeight;
  let resizeDomT = resizeDom.offsetTop
  document.onmousemove = e => {
    let resizeDomHeight, resizeDomTop
    // y轴方向拉伸时，上边按钮要区别处理
    resizeDomHeight = resizeYTop(tarDot, e, y, resizeDom, resizeDomTop, resizeDomT, resizeDomHeight, resizeDomH)
    // 添加限制边界(下)
    let { domHeights } = clacBoundary(resizeDom, parentDom, 0, resizeDomHeight)
    console.log('拉伸y方向top，height：' + resizeDomTop, domHeights)
    resizeDom.style.height = domHeights + 'px'
  }
  document.onmouseup = () => [document.onmousemove, document.onmouseup] = [null, null]
  e.preventDefault && e.preventDefault()
}

function startResizeXY(e, resizeDom, parentDom) {
  let tarDot = e.srcElement || e.target
  let x = e.clientX
  let y = e.clientY
  let resizeDomH = resizeDom.offsetHeight
  let resizeDomW = resizeDom.offsetWidth
  let resizeDomL = resizeDom.offsetLeft
  let resizeDomT = resizeDom.offsetTop
  document.onmousemove = e => {
    // let xx = e.clientX
    // let yy = e.clientY
    let resizeDomWidth, resizeDomLeft
    let resizeDomHeight, resizeDomTop
    // 处理左侧和上边dot拉伸
    resizeDomWidth = resizeXLeft(tarDot, e, x, resizeDom, resizeDomLeft, resizeDomL, resizeDomWidth, resizeDomW)
    resizeDomHeight = resizeYTop(tarDot, e, y, resizeDom, resizeDomTop, resizeDomT, resizeDomHeight, resizeDomH)
    // 添加（拉伸）限制边界
    let { domWidths, domHeights } = clacBoundary(resizeDom, parentDom, resizeDomWidth, resizeDomHeight)
    resizeDom.style.width = domWidths + 'px'
    resizeDom.style.height = domHeights + 'px'
    return false;
  }
  document.onmouseup = () => [document.onmousemove, document.onmouseup] = [null, null]
  e.preventDefault && e.preventDefault()
}

/* if (tarDot.className.indexOf('left') > -1) {
      // 左侧dot拉伸
      // if (e.clientX - x > 0 ) {
      // 左侧正向拉伸
      resizeDomLeft = resizeDomL + (e.clientX - x)
      // 左侧拉伸到left为0后，继续左拉，width不变，left置位0
      if (resizeDomLeft <= 0) {
        resizeDomLeft = 0
      } else {
        resizeDomWidth = resizeDomW - (e.clientX - x)
      }
      // } 
      // else {
      //   // 左侧负向拉伸
      //   resizeDomWidth = resizeDomW - (e.clientX - x)
      //   resizeDomLeft = resizeDomL + (e.clientX - x)
      // }
      resizeDom.style.left = resizeDomLeft + 'px'
    } else {
      // 右侧dot 拉伸
      resizeDomWidth = resizeDomW + e.clientX - x
    } */
// x轴方向拉伸时，左侧按钮要区别处理
function resizeXLeft(tarDot, e, x, resizeDom, resizeDomLeft, resizeDomL, resizeDomWidth, resizeDomW) {
  if (tarDot.className.indexOf('left') > -1) {
    // 左侧dot拉伸
    resizeDomLeft = resizeDomL + (e.clientX - x)
    // 左侧拉伸到left为0后，继续左拉，width不变，left置位0
    if (resizeDomLeft <= 0) {
      resizeDomLeft = 0
    } else {
      resizeDomWidth = resizeDomW - (e.clientX - x)
    }
    resizeDomWidth > 0 ? resizeDom.style.left = resizeDomLeft + 'px' : ''
  } else {
    // 右侧dot 拉伸
    resizeDomWidth = resizeDomW + e.clientX - x
  }
  return resizeDomWidth
}
// y轴方向拉伸时，上边按钮要区别处理
function resizeYTop(tarDot, e, y, resizeDom, resizeDomTop, resizeDomT, resizeDomHeight, resizeDomH) {
  if (tarDot.className.indexOf('up') > -1) {
    // y轴上方dot的拉伸
    resizeDomTop = resizeDomT + (e.clientY - y)
    if (resizeDomTop <= 0) {
      resizeDomTop = 0
    } else {
      resizeDomHeight = resizeDomH - (e.clientY - y)
    }
    resizeDomHeight > 0 ? resizeDom.style.top = resizeDomTop + 'px' : ''
  } else {
    resizeDomHeight = resizeDomH + e.clientY - y
  }
  return resizeDomHeight
}

let myMenu,curSelect
// select 右击删除
function addRightMenu(curDom) {
  
  curDom.onmouseup = function (e) {
    if (!e) e = window.event;
    if (e.button == 2) {
      if (curDom.className.indexOf('dot') > -1){
        return false
      }
      curSelect = curDom
      console.log('鼠标右击了')
      myMenu.style.display = 'block';
      myMenu.style.left = event.clientX + 'px';
      myMenu.style.top = event.clientY + 'px';
    }
  }
}
// window.onload = () => {

// }
function startSelect(params) {
  console.log(11);

  // 可以生成框选区的dom（class，或id）
  let domStr = '.t1'
  myMenu = queryDom('#rightMenu')
  // 创建鼠标拖拽生成选择区域
  createArea(domStr)
  document.onmouseup = function (params) {
    console.log('区域外抬起。。。')
    let tarDom = queryDom(domStr)
    // 生成选择框生成时，鼠标移到指定区域外，就清空move事件
    tarDom.onmousemove = null
    tarDom.onmouseup = null
    // 生成的选择框可拖拽
    // let selectArea = tarDom.lastElementChild // 最后插入的那个选择框
    let selectLength = tarDom.querySelectorAll('.select').length
    let selectArea = tarDom.querySelectorAll('.select')[selectLength - 1]
    selectLength ? selectAreaMove(selectArea, tarDom) : ''
    
  }
  document.onclick = function (ev) {
    let e = ev || window.event
    // 自定义菜单消失
    myMenu.style.display = 'none'
    if (e.target.className.indexOf('delIt') > -1) {
      curSelect.remove()
    }
  }
}
