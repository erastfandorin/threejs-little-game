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
    this.loaders.textureLoader = new THREE.TextureLoader();
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.loaders.fontLoader = new FontLoader();
  }

  startLoading(assetsNames) { // :array
    this.calculateInitialLoadingValue(assetsNames);

    assetsNames.forEach((asset) => {
      for (const source of this.sources[asset]) {
        if (source.type === "gltfModel") {

          const ktx2Loader = new KTX2Loader();
          ktx2Loader.setTranscoderPath("basis/");
          ktx2Loader.detectSupport(this.renderer.instance);
          this.loaders.gltfLoader.setKTX2Loader(ktx2Loader);

          const dracoLoader = new DRACOLoader();
          dracoLoader.setDecoderPath("/draco/");
          dracoLoader.setDecoderConfig( { type: 'js' } );
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
            undefined // onProgress callback for textures not supported in threejs
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

  calculateInitialLoadingValue(assetsNames) {
    this.sourcesTotalBytes = 0;
    this.filesToLoad = 0;

    assetsNames.forEach((asset) => {
      const assetTotalBytes = this.sources[asset].reduce(
        (totalBytes, source) => {
          return source.type !== "texture"
            ? totalBytes + Number(source.bytes)
            : totalBytes;
        },
        0
      );
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

    // const parser = file.parser;
    // const bufferPromises = parser.json.images.map((imageDef) => {
    //   return parser.getDependency('bufferView', imageDef.bufferView);
    // });
    // Promise.all(bufferPromises).then((buffers) => {
    //   console.log(buffers); // Array<ArrayBuffer>
    // });

    if (this.filesLoaded === this.filesToLoad) {
      this.trigger("ready");
    }
  }
}
