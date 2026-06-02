<template>
  <!-- 正常模式 -->
  <div
    v-show="!isFullscreen"
    class="zoom-container"
    ref="containerRef"
    v-bind="attrs"
    :style="containerStyle"
    @wheel.prevent="handleWheel"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <canvas ref="canvasRef" class="zoom-canvas"></canvas>

    <div class="loading-indicator" v-if="isLoading">加载中...</div>

    <!-- 小地图 -->
    <div
      class="minimap"
      ref="minimapRef"
      @mousedown="handleMinimapMouseDown"
      @wheel.stop
      :style="minimapStyle"
    >
      <canvas ref="minimapCanvasRef" class="minimap-canvas"></canvas>
      <div class="minimap-viewport" :style="minimapViewportStyle"></div>
    </div>

    <div class="zoom-controls" @wheel.stop @mousedown.stop>
      <div class="zoom-tool-group">
        <button @click="zoomIn" title="放大" class="zoom-tool-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            aria-hidden="true"
            role="img"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21l-4.35-4.35M11 8v6m-3-3h6"></path>
            </g>
          </svg>
        </button>
        <button @click="zoomOut" title="缩小" class="zoom-tool-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            aria-hidden="true"
            role="img"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21l-4.35-4.35M8 11h6"></path>
            </g>
          </svg>
        </button>
        <button @click="resetZoom" title="重置" class="zoom-tool-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            aria-hidden="true"
            role="img"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <path
                d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8"
              ></path>
              <path d="M3 3v5h5"></path>
            </g>
          </svg>
        </button>
      </div>
      <div class="zoom-divider-v"></div>
      <div class="zoom-tool-group">
        <button
          @click="toggleFullscreen"
          :title="isFullscreen ? '退出全屏' : '全屏'"
          class="zoom-tool-btn"
        >
          <svg
            v-if="!isFullscreen"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            aria-hidden="true"
            role="img"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3"
            ></path>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            aria-hidden="true"
            role="img"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- 全屏模式 -->
  <Teleport to="body">
    <div
      v-if="isFullscreen"
      class="fullscreen-overlay"
      @wheel.prevent="handleWheel"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <canvas ref="fullscreenCanvasRef" class="zoom-canvas"></canvas>

      <!-- 小地图 -->
      <div
        class="minimap"
        ref="fullscreenMinimapRef"
        @mousedown="handleMinimapMouseDown"
        @wheel.stop
        :style="minimapStyle"
      >
        <canvas
          ref="fullscreenMinimapCanvasRef"
          class="minimap-canvas"
        ></canvas>
        <div class="minimap-viewport" :style="minimapViewportStyle"></div>
      </div>

      <div class="zoom-controls" @wheel.stop @mousedown.stop>
        <div class="zoom-tool-group">
          <button @click="zoomIn" title="放大" class="zoom-tool-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21l-4.35-4.35M11 8v6m-3-3h6"></path>
              </g>
            </svg>
          </button>
          <button @click="zoomOut" title="缩小" class="zoom-tool-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21l-4.35-4.35M8 11h6"></path>
              </g>
            </svg>
          </button>
          <button @click="resetZoom" title="重置" class="zoom-tool-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              >
                <path
                  d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8"
                ></path>
                <path d="M3 3v5h5"></path>
              </g>
            </svg>
          </button>
        </div>
        <div class="zoom-divider-v"></div>
        <div class="zoom-tool-group">
          <button
            @click="toggleFullscreen"
            :title="isFullscreen ? '退出全屏' : '全屏'"
            class="zoom-tool-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  useAttrs,
} from "vue";
import { withBase } from "vitepress";

// 禁用自动属性继承，手动控制 style 应用
defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  minZoom: {
    type: Number,
    default: 1.0, // 允许缩小到 10%
  },
  maxZoom: {
    type: Number,
    default: 100,
  },
  zoomStep: {
    type: Number,
    default: 1.2,
  },
});

const containerRef = ref(null);
const canvasRef = ref(null);
const fullscreenCanvasRef = ref(null);

const minimapRef = ref(null);
const minimapCanvasRef = ref(null);
const fullscreenMinimapRef = ref(null);
const fullscreenMinimapCanvasRef = ref(null);

const isLoading = ref(true);
const isFullscreen = ref(false);

// 小地图相关
let minimapCtx = null;
let fullscreenMinimapCtx = null;
let minimapAnimationFrameId = null;
const minimapStyle = ref({
  width: "150px",
  height: "100px",
});

// 图片宽高比（用于容器默认高度）
const imageAspectRatio = ref(null);

// 容器样式（包含动态宽高比）
const containerStyle = computed(() => {
  if (imageAspectRatio.value) {
    return {
      height: "auto",
      aspectRatio: imageAspectRatio.value,
    };
  }
  return { height: "400px" };
});

// 缩放和平移状态
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);

// 拖拽状态
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const initialTranslateX = ref(0);
const initialTranslateY = ref(0);

// 图片和Canvas相关
let ctx = null;
let fullscreenCtx = null;
let originalImage = null;
let animationFrameId = null;

// 多分辨率图片缓存
const imageCache = ref(new Map()); // 缩放级别 -> 图片对象
const currentZoomLevel = ref(null);
const debounceTimer = ref(null);

// 定义缩放级别和对应的分辨率
const zoomLevels = [
  { maxScale: 0.25, resolution: 512 }, // 极小缩放：512px
  { maxScale: 0.5, resolution: 1024 }, // 小缩放：1024px
  { maxScale: 1, resolution: 1920 }, // 原始大小：1920px
  { maxScale: 2, resolution: 2560 }, // 轻微放大：2560px
  { maxScale: 5, resolution: 3840 }, // 中等放大：3840px
  { maxScale: Infinity, resolution: null }, // 大幅放大：使用原图
];

// 根据当前缩放获取合适的缩放级别
const getZoomLevel = (currentScale) => {
  for (let i = 0; i < zoomLevels.length; i++) {
    if (currentScale <= zoomLevels[i].maxScale) {
      return i;
    }
  }
  return zoomLevels.length - 1;
};

// 创建降采样图片
const createDownsampledImage = (targetResolution) => {
  return new Promise((resolve, reject) => {
    if (!originalImage) {
      reject(new Error("原始图片未加载"));
      return;
    }

    // 如果目标分辨率大于等于原图，直接使用原图
    if (
      targetResolution &&
      targetResolution >= Math.max(originalImage.width, originalImage.height)
    ) {
      resolve(originalImage);
      return;
    }

    // 计算降采样后的尺寸（保持宽高比）
    const aspectRatio = originalImage.width / originalImage.height;
    let targetWidth, targetHeight;

    if (aspectRatio > 1) {
      targetWidth = targetResolution;
      targetHeight = Math.floor(targetResolution / aspectRatio);
    } else {
      targetHeight = targetResolution;
      targetWidth = Math.floor(targetResolution * aspectRatio);
    }

    // 创建离屏Canvas进行降采样
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = targetWidth;
    offscreenCanvas.height = targetHeight;
    const offCtx = offscreenCanvas.getContext("2d");

    // 高质量降采样
    offCtx.imageSmoothingEnabled = true;
    offCtx.imageSmoothingQuality = "high";
    offCtx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

    // 创建新的图片对象
    const downsampledImg = new Image();
    downsampledImg.onload = () => resolve(downsampledImg);
    downsampledImg.onerror = reject;
    downsampledImg.src = offscreenCanvas.toDataURL("image/png");
  });
};

// 更新当前使用的图片（带防抖）
const updateCurrentImage = async () => {
  const newZoomLevel = getZoomLevel(scale.value);

  // 如果缩放级别没有变化，不需要更新
  if (newZoomLevel === currentZoomLevel.value) return;

  currentZoomLevel.value = newZoomLevel;
  const levelConfig = zoomLevels[newZoomLevel];

  // 检查缓存中是否已有该分辨率的图片
  if (imageCache.value.has(newZoomLevel)) {
    render();
    return;
  }

  // 如果需要使用原图，直接设置
  if (levelConfig.resolution === null) {
    imageCache.value.set(newZoomLevel, originalImage);
    render();
    return;
  }

  // 创建降采样图片
  try {
    const downsampledImg = await createDownsampledImage(levelConfig.resolution);
    imageCache.value.set(newZoomLevel, downsampledImg);
    render();
  } catch (error) {
    console.error("创建降采样图片失败:", error);
  }
};

// 更新小地图尺寸以匹配图片宽高比（宽度和高度都调整，但保持图片比例）
const updateMinimapSize = () => {
  if (!originalImage) return;

  const aspectRatio = originalImage.width / originalImage.height;

  // 设定一个基础尺寸（假设是正方形时的大小）
  const baseSize = 120;

  let width, height;
  if (aspectRatio > 1) {
    // 横向图片：宽度固定，高度按比例
    width = baseSize;
    height = baseSize / aspectRatio;
  } else {
    // 纵向图片：高度固定，宽度按比例
    height = baseSize;
    width = baseSize * aspectRatio;
  }

  // 限制最大尺寸，避免小地图过大
  const maxSize = 200;
  if (width > maxSize || height > maxSize) {
    if (aspectRatio > 1) {
      width = maxSize;
      height = maxSize / aspectRatio;
    } else {
      height = maxSize;
      width = maxSize * aspectRatio;
    }
  }

  // 限制最小尺寸
  const minSize = 60;
  width = Math.max(width, minSize);
  height = Math.max(height, minSize);

  minimapStyle.value = {
    width: `${width}px`,
    height: `${height}px`,
  };

  // 等待 DOM 更新后重新初始化小地图 canvas
  nextTick(() => {
    initMinimapCanvas(minimapCanvasRef.value, minimapRef.value, minimapCtx);
    if (isFullscreen.value) {
      initMinimapCanvas(
        fullscreenMinimapCanvasRef.value,
        fullscreenMinimapRef.value,
        fullscreenMinimapCtx,
      );
    }
  });
};

// 获取当前应该使用的图片
const getCurrentImage = () => {
  const level =
    currentZoomLevel.value !== null
      ? currentZoomLevel.value
      : getZoomLevel(scale.value);
  return imageCache.value.get(level) || originalImage;
};

// 加载图片
const loadImage = () => {
  isLoading.value = true;
  imageCache.value.clear();
  currentZoomLevel.value = null;

  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    originalImage = img;
    isLoading.value = false;

    // 设置图片宽高比
    imageAspectRatio.value = img.naturalWidth / img.naturalHeight;

    // 初始化缓存：将原图作为最高级别缓存
    const highestLevel = zoomLevels.length - 1;
    imageCache.value.set(highestLevel, img);
    currentZoomLevel.value = highestLevel;

    nextTick(() => {
      resizeCanvas();
      // 更新小地图尺寸以匹配图片宽高比
      updateMinimapSize();
      // 预生成第一个缩放级别的图片
      updateCurrentImage();
    });
  };

  img.onerror = () => {
    console.error("图片加载失败");
    isLoading.value = false;
  };

  img.src = withBase(props.src);
};

// 初始化小地图 canvas 的尺寸和 context
const initMinimapCanvas = (canvas, minimap, context) => {
  if (!canvas || !minimap || !context) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = minimap.getBoundingClientRect();

  // 重置变换矩阵
  context.setTransform(1, 0, 0, 1, 0, 0);

  // 设置 canvas 实际分辨率
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // 应用设备像素比缩放
  context.scale(dpr, dpr);
};

// 调整Canvas尺寸
const resizeCanvas = () => {
  if (!canvasRef.value || !containerRef.value) return;

  const container = containerRef.value;
  const canvas = canvasRef.value;
  const dpr = window.devicePixelRatio || 1;

  // 重置变换矩阵，确保新的scale不会叠加
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // 强制重新获取容器尺寸
  const rect = container.getBoundingClientRect();

  // 设置Canvas显示尺寸
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  // 设置Canvas实际分辨率
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // 应用设备像素比缩放
  ctx.scale(dpr, dpr);

  // 如果在全屏模式，也需要调整全屏 canvas
  if (isFullscreen.value && fullscreenCanvasRef.value) {
    const fullscreenCanvas = fullscreenCanvasRef.value;
    fullscreenCanvas.width = window.innerWidth * dpr;
    fullscreenCanvas.height = window.innerHeight * dpr;

    if (fullscreenCtx) {
      fullscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
      fullscreenCtx.scale(dpr, dpr);
    }
  }

  render();
};

// 渲染函数
const render = () => {
  const currentImage = getCurrentImage();
  if (!currentImage) return;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId = requestAnimationFrame(() => {
    const dpr = window.devicePixelRatio || 1;

    // 渲染到正常模式的 canvas
    if (canvasRef.value && containerRef.value) {
      const canvas = canvasRef.value;
      const container = containerRef.value;

      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      renderToCanvas(
        ctx,
        canvas,
        containerWidth,
        containerHeight,
        currentImage,
        dpr,
      );
    }

    // 渲染到全屏模式的 canvas
    if (fullscreenCanvasRef.value && isFullscreen.value) {
      const canvas = fullscreenCanvasRef.value;
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;

      // 确保 fullscreenCanvasRef 有 context
      if (!fullscreenCtx) {
        fullscreenCtx = canvas.getContext("2d");
      }

      if (fullscreenCtx) {
        fullscreenCtx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        renderToCanvas(
          fullscreenCtx,
          canvas,
          containerWidth,
          containerHeight,
          currentImage,
          dpr,
        );
      }
    }

    // 同时渲染小地图
    renderMinimap();
  });
};

// 渲染到指定 canvas
const renderToCanvas = (
  context,
  canvas,
  containerWidth,
  containerHeight,
  currentImage,
  dpr,
) => {
  const imgAspectRatio = currentImage.width / currentImage.height;
  const containerAspectRatio = containerWidth / containerHeight;

  // 使用 contain 模式：图片完整显示在容器内，可能有空白边
  let renderWidth, renderHeight;
  if (imgAspectRatio > containerAspectRatio) {
    // 图片更宽，以宽度为准（contain）
    renderWidth = containerWidth;
    renderHeight = containerWidth / imgAspectRatio;
  } else {
    // 图片更高，以高度为准（contain）
    renderHeight = containerHeight;
    renderWidth = containerHeight * imgAspectRatio;
  }

  context.save();
  context.translate(containerWidth / 2, containerHeight / 2);
  context.scale(scale.value, scale.value);
  context.translate(translateX.value, translateY.value);

  context.drawImage(
    currentImage,
    -renderWidth / 2,
    -renderHeight / 2,
    renderWidth,
    renderHeight,
  );

  context.restore();
};

// 触发图片更新（带防抖）
const triggerImageUpdate = () => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }

  debounceTimer.value = setTimeout(() => {
    updateCurrentImage();
  }, 100); // 100ms防抖延迟
};

// 小地图视口样式
const minimapViewportStyle = computed(() => {
  // 根据当前模式选择对应的容器和小地图
  const container = isFullscreen.value
    ? { clientWidth: window.innerWidth, clientHeight: window.innerHeight }
    : containerRef.value;
  const minimap = isFullscreen.value
    ? fullscreenMinimapRef.value
    : minimapRef.value;

  if (!container || !minimap) return {};

  const currentImage = getCurrentImage();
  if (!currentImage) return {};

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const minimapWidth = minimap.clientWidth;
  const minimapHeight = minimap.clientHeight;

  // 计算图片在容器中的基础显示尺寸（scale=1时）
  const imgAspectRatio = currentImage.width / currentImage.height;
  const containerAspectRatio = containerWidth / containerHeight;

  // 使用 contain 模式计算基础尺寸
  let baseWidth, baseHeight;
  if (imgAspectRatio > containerAspectRatio) {
    // 图片更宽，以宽度为准（contain）
    baseWidth = containerWidth;
    baseHeight = containerWidth / imgAspectRatio;
  } else {
    // 图片更高，以高度为准（contain）
    baseHeight = containerHeight;
    baseWidth = containerHeight * imgAspectRatio;
  }

  // 当前缩放
  const currentScale = scale.value;
  const scaledWidth = baseWidth * currentScale;
  const scaledHeight = baseHeight * currentScale;

  // 计算小地图中图片的显示尺寸
  const minimapAspectRatio = minimapWidth / minimapHeight;

  let minimapImgWidth, minimapImgHeight;
  if (imgAspectRatio > minimapAspectRatio) {
    minimapImgWidth = minimapWidth;
    minimapImgHeight = minimapWidth / imgAspectRatio;
  } else {
    minimapImgHeight = minimapHeight;
    minimapImgWidth = minimapHeight * imgAspectRatio;
  }

  const minimapImgOffsetX = (minimapWidth - minimapImgWidth) / 2;
  const minimapImgOffsetY = (minimapHeight - minimapImgHeight) / 2;

  // 小地图相对于缩放后图片的比例
  const minimapToScaledRatio = minimapImgWidth / scaledWidth;

  // 蓝框尺寸：容器在小地图上的对应尺寸（保持容器高宽比）
  const boxWidth = containerWidth * minimapToScaledRatio;
  const boxHeight = containerHeight * minimapToScaledRatio;

  // 计算图片中心相对于容器中心的偏移
  const imageOffsetX = translateX.value * currentScale;
  const imageOffsetY = translateY.value * currentScale;

  // 蓝框中心 = 图片中心 - 图片偏移
  const boxCenterX =
    minimapImgOffsetX +
    minimapImgWidth / 2 -
    imageOffsetX * minimapToScaledRatio;
  const boxCenterY =
    minimapImgOffsetY +
    minimapImgHeight / 2 -
    imageOffsetY * minimapToScaledRatio;

  // 蓝框左上角
  let boxLeft = boxCenterX - boxWidth / 2;
  let boxTop = boxCenterY - boxHeight / 2;
  let boxRight = boxLeft + boxWidth;
  let boxBottom = boxTop + boxHeight;

  // 裁剪超出小地图图片区域的部分
  boxLeft = Math.max(boxLeft, minimapImgOffsetX);
  boxTop = Math.max(boxTop, minimapImgOffsetY);
  boxRight = Math.min(boxRight, minimapImgOffsetX + minimapImgWidth);
  boxBottom = Math.min(boxBottom, minimapImgOffsetY + minimapImgHeight);

  // 如果完全超出，隐藏
  if (boxLeft >= boxRight || boxTop >= boxBottom) {
    return { display: "none" };
  }

  return {
    left: `${boxLeft}px`,
    top: `${boxTop}px`,
    width: `${boxRight - boxLeft}px`,
    height: `${boxBottom - boxTop}px`,
  };
});

// 渲染小地图
const renderMinimap = () => {
  // 根据当前模式选择对应的小地图 canvas 和 ref
  const canvas = isFullscreen.value
    ? fullscreenMinimapCanvasRef.value
    : minimapCanvasRef.value;
  const minimap = isFullscreen.value
    ? fullscreenMinimapRef.value
    : minimapRef.value;
  const ctx = isFullscreen.value ? fullscreenMinimapCtx : minimapCtx;

  if (!ctx || !canvas || !minimap) return;

  const currentImage = getCurrentImage();
  if (!currentImage) return;

  if (minimapAnimationFrameId) {
    cancelAnimationFrame(minimapAnimationFrameId);
  }

  minimapAnimationFrameId = requestAnimationFrame(() => {
    const dpr = window.devicePixelRatio || 1;
    const rect = minimap.getBoundingClientRect();

    // 清空小地图（注意：canvas 已经在 initMinimapCanvas 中设置了正确的尺寸和 scale）
    ctx.clearRect(0, 0, rect.width, rect.height);

    // 计算小地图中图片的显示尺寸（保持宽高比）
    const imgAspectRatio = currentImage.width / currentImage.height;
    const minimapAspectRatio = rect.width / rect.height;

    let minimapImgWidth, minimapImgHeight;
    if (imgAspectRatio > minimapAspectRatio) {
      minimapImgWidth = rect.width;
      minimapImgHeight = rect.width / imgAspectRatio;
    } else {
      minimapImgHeight = rect.height;
      minimapImgWidth = rect.height * imgAspectRatio;
    }

    // 居中绘制缩略图
    const offsetX = (rect.width - minimapImgWidth) / 2;
    const offsetY = (rect.height - minimapImgHeight) / 2;

    ctx.drawImage(
      currentImage,
      0,
      0,
      currentImage.width,
      currentImage.height,
      offsetX,
      offsetY,
      minimapImgWidth,
      minimapImgHeight,
    );
  });
};

// 小地图鼠标交互
const handleMinimapMouseDown = (e) => {
  e.stopPropagation();
  e.preventDefault();

  const currentImage = getCurrentImage();
  if (!currentImage) return;

  // 根据当前模式选择对应的容器和小地图
  const container = isFullscreen.value
    ? { clientWidth: window.innerWidth, clientHeight: window.innerHeight }
    : containerRef.value;
  const minimap = isFullscreen.value
    ? fullscreenMinimapRef.value
    : minimapRef.value;

  if (!container || !minimap) return;

  const rect = minimap.getBoundingClientRect();

  // 点击位置在小地图坐标系中
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // 计算小地图中图片的显示尺寸和偏移
  const imgAspectRatio = currentImage.width / currentImage.height;
  const minimapAspectRatio = rect.width / rect.height;

  let minimapImgWidth, minimapImgHeight;
  if (imgAspectRatio > minimapAspectRatio) {
    minimapImgWidth = rect.width;
    minimapImgHeight = rect.width / imgAspectRatio;
  } else {
    minimapImgHeight = rect.height;
    minimapImgWidth = rect.height * imgAspectRatio;
  }

  const minimapImgOffsetX = (rect.width - minimapImgWidth) / 2;
  const minimapImgOffsetY = (rect.height - minimapImgHeight) / 2;

  // 计算图片在容器中的基础显示尺寸
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const containerAspectRatio = containerWidth / containerHeight;

  // 使用 contain 模式计算基础尺寸
  let baseWidth, baseHeight;
  if (imgAspectRatio > containerAspectRatio) {
    // 图片更宽，以宽度为准（contain）
    baseWidth = containerWidth;
    baseHeight = containerWidth / imgAspectRatio;
  } else {
    // 图片更高，以高度为准（contain）
    baseHeight = containerHeight;
    baseWidth = containerHeight * imgAspectRatio;
  }

  // 点击位置相对于小地图图片左上角的坐标
  const clickRelativeX = clickX - minimapImgOffsetX;
  const clickRelativeY = clickY - minimapImgOffsetY;

  // 转换为缩放后图片上的位置
  const minimapToScaledRatio = (baseWidth * scale.value) / minimapImgWidth;
  const scaledImageX = clickRelativeX * minimapToScaledRatio;
  const scaledImageY = clickRelativeY * minimapToScaledRatio;

  // 转换为相对于图片中心的坐标
  const imageCenterX = scaledImageX - (baseWidth * scale.value) / 2;
  const imageCenterY = scaledImageY - (baseHeight * scale.value) / 2;

  // 设置新的translate值，使点击位置成为容器中心
  translateX.value = -imageCenterX / scale.value;
  translateY.value = -imageCenterY / scale.value;

  render();
};

// 鼠标滚轮缩放
const handleWheel = (e) => {
  const zoomFactor = e.deltaY > 0 ? 1 / props.zoomStep : props.zoomStep;
  const newScale = Math.min(
    Math.max(scale.value * zoomFactor, props.minZoom),
    props.maxZoom,
  );
  scale.value = newScale;

  render();
  triggerImageUpdate();
};

// 鼠标按下
const handleMouseDown = (e) => {
  isDragging.value = true;
  dragStartX.value = e.clientX;
  dragStartY.value = e.clientY;
  initialTranslateX.value = translateX.value;
  initialTranslateY.value = translateY.value;

  e.preventDefault();

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  document.body.style.userSelect = "none";
};

// 鼠标移动
const handleMouseMove = (e) => {
  if (!isDragging.value) return;

  e.preventDefault();

  const deltaX = e.clientX - dragStartX.value;
  const deltaY = e.clientY - dragStartY.value;

  translateX.value = initialTranslateX.value + deltaX / scale.value;
  translateY.value = initialTranslateY.value + deltaY / scale.value;

  render();
};

// 鼠标释放
const handleMouseUp = () => {
  isDragging.value = false;

  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
  document.body.style.userSelect = "";

  // 拖拽结束后检查是否需要更新图片
  triggerImageUpdate();
};

// 触摸相关状态
const touchState = ref({
  active: false,
  touches: [],
  initialDistance: 0,
  initialScale: 1,
  lastTouches: [],
});

// 触摸开始
const handleTouchStart = (e) => {
  // 检查触摸目标是否是控件元素
  const target = e.target;
  if (
    target.tagName === "BUTTON" ||
    target.closest(".zoom-controls") ||
    target.closest(".minimap")
  ) {
    // 如果是控件，让控件自己处理触摸事件
    return;
  }

  if (e.touches.length === 1) {
    // 单指：准备拖拽
    touchState.value.active = true;
    touchState.value.touches = [e.touches[0]];
    touchState.value.lastTouches = [e.touches[0]];

    isDragging.value = true;
    dragStartX.value = e.touches[0].clientX;
    dragStartY.value = e.touches[0].clientY;
    initialTranslateX.value = translateX.value;
    initialTranslateY.value = translateY.value;
  } else if (e.touches.length === 2) {
    // 双指：准备缩放
    touchState.value.active = true;
    touchState.value.touches = [e.touches[0], e.touches[1]];

    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    touchState.value.initialDistance = Math.sqrt(dx * dx + dy * dy);
    touchState.value.initialScale = scale.value;

    isDragging.value = false;
  }

  // 只在事件可取消且在非控件区域时阻止默认行为
  if (e.cancelable) {
    e.preventDefault();
  }
};

// 触摸移动
const handleTouchMove = (e) => {
  if (!touchState.value.active) return;

  // 检查触摸目标是否是控件元素
  const target = e.target;
  if (
    target.tagName === "BUTTON" ||
    target.closest(".zoom-controls") ||
    target.closest(".minimap")
  ) {
    // 如果是控件，不处理图片操作
    return;
  }

  if (e.touches.length === 1 && touchState.value.touches.length === 1) {
    // 单指拖拽
    const deltaX = e.touches[0].clientX - dragStartX.value;
    const deltaY = e.touches[0].clientY - dragStartY.value;

    translateX.value = initialTranslateX.value + deltaX / scale.value;
    translateY.value = initialTranslateY.value + deltaY / scale.value;

    render();
  } else if (e.touches.length === 2) {
    // 双指缩放
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const currentDistance = Math.sqrt(dx * dx + dy * dy);

    if (touchState.value.initialDistance > 0) {
      const scaleFactor = currentDistance / touchState.value.initialDistance;
      const newScale = Math.min(
        Math.max(touchState.value.initialScale * scaleFactor, props.minZoom),
        props.maxZoom,
      );
      scale.value = newScale;
      render();
    }
  }

  // 只在事件可取消且在非控件区域时阻止默认行为
  if (e.cancelable) {
    e.preventDefault();
  }
};

// 触摸结束
const handleTouchEnd = (e) => {
  // 检查触摸目标是否是控件元素
  const target = e.target;
  if (
    target.tagName === "BUTTON" ||
    target.closest(".zoom-controls") ||
    target.closest(".minimap")
  ) {
    // 如果是控件，不处理图片操作
    return;
  }

  if (e.touches.length === 0) {
    touchState.value.active = false;
    touchState.value.touches = [];
    isDragging.value = false;
    triggerImageUpdate();
  } else if (e.touches.length === 1 && touchState.value.touches.length === 2) {
    // 从双指变为单指
    touchState.value.touches = [e.touches[0]];
    touchState.value.initialDistance = 0;
  }

  // 只在事件可取消且在非控件区域时阻止默认行为
  if (e.cancelable) {
    e.preventDefault();
  }
};

// 放大
const zoomIn = () => {
  scale.value = Math.min(scale.value * props.zoomStep, props.maxZoom);
  render();
  triggerImageUpdate();
};

// 缩小
const zoomOut = () => {
  scale.value = Math.max(scale.value / props.zoomStep, props.minZoom);
  render();
  triggerImageUpdate();
};

// 重置
const resetZoom = () => {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
  render();
  triggerImageUpdate();
};

// 全屏切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;

  nextTick(() => {
    if (isFullscreen.value) {
      // 进入全屏：初始化全屏 canvas
      if (fullscreenCanvasRef.value) {
        const dpr = window.devicePixelRatio || 1;
        fullscreenCanvasRef.value.width = window.innerWidth * dpr;
        fullscreenCanvasRef.value.height = window.innerHeight * dpr;

        // 每次都重新初始化 context（因为组件可能被销毁重建）
        fullscreenCtx = fullscreenCanvasRef.value.getContext("2d");

        if (fullscreenCtx) {
          fullscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
          fullscreenCtx.scale(dpr, dpr);
        }
      }

      // 初始化全屏小地图 canvas 和 context
      if (fullscreenMinimapCanvasRef.value && fullscreenMinimapRef.value) {
        fullscreenMinimapCtx =
          fullscreenMinimapCanvasRef.value.getContext("2d");
        initMinimapCanvas(
          fullscreenMinimapCanvasRef.value,
          fullscreenMinimapRef.value,
          fullscreenMinimapCtx,
        );
      }

      document.body.style.overflow = "hidden";
    } else {
      // 退出全屏：恢复正常模式
      document.body.style.overflow = "";
      // 清理全屏 context
      fullscreenCtx = null;
      fullscreenMinimapCtx = null;

      // 确保普通模式 canvas 尺寸正确
      nextTick(() => {
        if (canvasRef.value && containerRef.value) {
          const dpr = window.devicePixelRatio || 1;
          ctx = canvasRef.value.getContext("2d");
          if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
          }
          // 确保尺寸正确并重新渲染
          resizeCanvas();
          render();
        }
      });
    }

    // 重新渲染
    render();
  });
};

// 监听src变化
watch(
  () => props.src,
  () => {
    loadImage();
  },
);

// 监听窗口大小变化
const handleResize = () => {
  resizeCanvas();
};

// 组件挂载
onMounted(() => {
  ctx = canvasRef.value?.getContext("2d");
  minimapCtx = minimapCanvasRef.value?.getContext("2d");
  loadImage();
  window.addEventListener("resize", handleResize);

  // 初始化小地图 canvas
  nextTick(() => {
    initMinimapCanvas(minimapCanvasRef.value, minimapRef.value, minimapCtx);
    renderMinimap();
  });
});

// 组件卸载
onUnmounted(() => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
  document.body.style.userSelect = "";
  window.removeEventListener("resize", handleResize);

  // 退出全屏（如果处于全屏状态）
  if (isFullscreen.value) {
    document.body.style.overflow = "";
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  if (minimapAnimationFrameId) {
    cancelAnimationFrame(minimapAnimationFrameId);
  }

  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }

  // 清理图片资源
  imageCache.value.clear();
  originalImage = null;

  // 清理 context
  ctx = null;
  fullscreenCtx = null;
  minimapCtx = null;
  fullscreenMinimapCtx = null;
});
</script>

<style scoped>
.zoom-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  user-select: none;
  cursor: grab;
  box-sizing: border-box;
  touch-action: none;
}

.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  user-select: none;
  cursor: grab;
  z-index: 9999;
  touch-action: none;
}

.zoom-canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--vp-c-bg-elv);
  padding: 12px 24px;
  border-radius: 4px;
  box-shadow: var(--vp-shadow-2);
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.zoom-controls {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(var(--vp-c-bg-rgb, 255, 255, 255), 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  display: flex;
  padding: 4px;
  gap: 2px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  opacity: 0.4;
  transform: translateY(0);
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 20;
}

.zoom-container:hover .zoom-controls,
.fullscreen-overlay:hover .zoom-controls {
  opacity: 1;
}

.zoom-tool-group {
  display: flex;
  gap: 2px;
}

.zoom-tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.zoom-tool-btn:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.zoom-divider-v {
  width: 1px;
  height: 20px;
  background: var(--vp-c-divider);
  align-self: center;
  margin: 0 4px;
}

.minimap {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  box-shadow: var(--vp-shadow-2);
  overflow: hidden;
  cursor: pointer;
  z-index: 10;
}

.minimap-canvas {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

.minimap-viewport {
  position: absolute;
  border: 2px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  pointer-events: none;
  transition: all 0.1s ease-out;
}
</style>
