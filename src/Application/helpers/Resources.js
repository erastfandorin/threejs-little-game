import * as THREE from "three";
import EventEmitter from "./EventEmitter.js";
import Application from "../Application";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { MeshoptDecoder } from "meshoptimizer";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    this.application = new Application();
    this.renderer = this.application.renderer;

    this.items = {};
    this.sources = sources;

    this.setLoaders();
    this.startLoading(["initialSources"]);
  }

  setLoaders() {
    this.loaders = {};
    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    this.loaders.hdriLoader = new RGBELoader();
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.loaders.fontLoader = new FontLoader();
    this.loaders.textureLoader = this.initAjaxTextureLoader();
  }

  startLoading(assetsNames) {
    // assetsNames: array
    this.calculateLoadingValue(assetsNames);

    assetsNames.forEach((asset) => {
      for (const source of this.sources[asset]) {
        if (source.type === "gltfModel") {
          const ktx2Loader = new KTX2Loader();
          ktx2Loader.setTranscoderPath("basis/");
          ktx2Loader.detectSupport(this.renderer.instance);
          this.loaders.gltfLoader.setKTX2Loader(ktx2Loader);

          const dracoLoader = new DRACOLoader();
          dracoLoader.setDecoderPath("/draco/");
          dracoLoader.setDecoderConfig({ type: "js" });
          this.loaders.gltfLoader.setDRACOLoader(dracoLoader);

          this.loaders.gltfLoader.load(
            source.path,
            (file) => this.sourceLoaded(source, file),
            (xhr) => this.sourceLoadingProgress(xhr, source.bytes)
          );
          ktx2Loader.dispose();
          dracoLoader.dispose();
        } else if (source.type === "fbxModel") {
          this.loaders.fbxLoader.load(
            source.path,
            (file) => this.sourceLoaded(source, file),
            (xhr) => this.sourceLoadingProgress(xhr, source.bytes)
          );
        } else if (source.type === "texture") {
          this.loaders.textureLoader.load(
            source.path,
            (file) => this.sourceLoaded(source, file),
            (xhr) => this.sourceLoadingProgress(xhr, source.bytes)
          );
        } else if (source.type === "font") {
          this.loaders.fontLoader.load(
            source.path,
            (file) => this.sourceLoaded(source, file),
            (xhr) => this.sourceLoadingProgress(xhr, source.bytes)
          );
        } else if (source.type === "hdri") {
          this.loaders.hdriLoader.load(
            source.path,
            (file) => this.sourceLoaded(source, file),
            (xhr) => this.sourceLoadingProgress(xhr, source.bytes)
          );
        } else if (source.type === "cubeTexture") {
          this.loaders.cubeTextureLoader.load(
            source.path,
            (file) => this.sourceLoaded(source, file),
            (xhr) => this.sourceLoadingProgress(xhr, source.bytes)
          );
        }
      }
    });
  }

  calculateLoadingValue(assetsNames) {
    this.sourcesTotalBytes = 0;
    this.filesToLoad = 0;

    assetsNames.forEach((asset) => {
      const assetTotalBytes = this.sources[asset].reduce((totalBytes, source) => totalBytes + Number(source.bytes), 0);
      this.filesToLoad = this.filesToLoad + this.sources[asset].length;
      this.sourcesTotalBytes = this.sourcesTotalBytes + assetTotalBytes;
    });

    this.bytesLoaded = 0;
    this.loadingProgress = 0;
    this.filesLoaded = 0;
  }

  sourceLoadingProgress(xhr, sourceTotalBytes) {
    if (xhr.loaded === Number(sourceTotalBytes)) {
      this.bytesLoaded += xhr.loaded;
    }

    this.loadingProgress = this.bytesLoaded / this.sourcesTotalBytes;
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file;

    this.filesLoaded++;

    this.isSourceLoad = this.filesLoaded === this.filesToLoad;

    if (this.isSourceLoad) {
      this.trigger("ready");
    }
  }

  initAjaxTextureLoader() {
    /**
     * Three's texture loader doesn't support onProgress events, because it uses image tags under the hood.
     *
     * A relatively simple workaround is to AJAX the file into the cache with a FileLoader, create an image from the Blob,
     * then extract that into a texture with a separate TextureLoader call.
     *
     * The cache is in memory, so this will work even if the server doesn't return a cache-control header.
     */
    const cache = THREE.Cache;
    cache.enabled = true;

    const textureLoader = new THREE.TextureLoader();
    const fileLoader = new THREE.FileLoader();
    fileLoader.setResponseType("blob");

    function load(url, onLoad, onProgress, onError) {
      fileLoader.load(url, cacheImage, onProgress, onError);

      /**
       * The cache is currently storing a Blob, but we need to cast it to an Image
       * or else it won't work as a texture. TextureLoader won't do this automatically.
       */
      function cacheImage(blob) {
        // ObjectURLs should be released as soon as is safe, to free memory
        const objUrl = URL.createObjectURL(blob);
        const image = document.createElementNS("http://www.w3.org/1999/xhtml", "img");

        image.onload = () => {
          cache.add(url, image);
          URL.revokeObjectURL(objUrl);
          document.body.removeChild(image);
          loadImageAsTexture();
        };

        image.src = objUrl;
        image.style.visibility = "hidden";
        document.body.appendChild(image);
      }

      function loadImageAsTexture() {
        textureLoader.load(url, onLoad, () => {}, onError);
      }
    }

    return Object.assign({}, textureLoader, { load });
  }
}
