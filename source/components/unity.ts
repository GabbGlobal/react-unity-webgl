import "../declarations/unityInstance";
import "../declarations/window";
import { createElement, PureComponent } from "react";
import IUnityProps from "../interfaces/unityProps";
import UnityContext from "../models/unityContext";
import UnityLoaderService from "../services/unityLoaderService";

export default class Unity extends PureComponent<IUnityProps, {}> {
  /**
   * The UnityContext passed by the props.
   * @type {UnityContext}
   */
  private unityContext: UnityContext = this.props.unityContext;

  /**
   * The UnityLoader service instance.
   * @type {UnityLoaderService}
   */
  private unityLoaderService: UnityLoaderService = new UnityLoaderService();

  /**
   * A reference to the html canvas element the UnityInstance will use.
   */
  private htmlCanvasElementReference?: HTMLCanvasElement;

  /**
   * Event invoked by the UnityInstance when the initialization is progressing.
   * Will be used to track the loading progression and invokes the event listeners
   * for both 'progress' and 'loaded' when the progression hits a value of '1'.
   * @param {number} progression
   */
  private onProgress(progression: number): void {
    this.unityContext.invokeEventListener("progress", progression);
    if (progression === 1) {
      this.unityContext.invokeEventListener("loaded");
    }
  }

  /**
   * Event invoked when the component is mounted. This sets the component
   * reference and starts the mounting of the UnityInstance.
   */
  public componentDidMount(): void {
    this.unityContext.setComponentReference(this);
    this.mountUnityInstance();
  }

  /**
   * Event invoked when the component will unmount. This force quits the
   * UnityInstance which will clear it from the memory.
   */
  public componentWillUnmount(): void {
    this.unityContext.quitUnityInstance();
  }

  /**
   * Initialized the Unity Loader and mounts the UnityInstance to the component.
   */
  private async mountUnityInstance(): Promise<void> {
    try {
      await this.unityLoaderService.load(
        this.unityContext.unityConfig.loaderUrl
      );
      const _unityInstanceParamters = {
        dataUrl: this.unityContext.unityConfig.dataUrl,
        frameworkUrl: this.unityContext.unityConfig.frameworkUrl,
        codeUrl: this.unityContext.unityConfig.codeUrl,
        streamingAssetsUrl: this.unityContext.unityConfig.streamingAssetsUrl,
        companyName: this.unityContext.unityConfig.companyName,
        productName: this.unityContext.unityConfig.productName,
        productVersion: this.unityContext.unityConfig.productVersion,
      };
      const _unityInstance = await window.createUnityInstance(
        this.htmlCanvasElementReference!,
        _unityInstanceParamters,
        this.onProgress.bind(this)
      );
      this.unityContext.setUnityInstance(_unityInstance);
    } catch (error) {
      console.warn(
        "Something went wrong while mouting the UnityInstance",
        error
      );
    }
  }

  /**
   * Renders the unity wrapper and player.
   * @returns {React.ReactNode} element
   */
  public render(): React.ReactNode {
    return createElement("canvas", {
      className: this.props.className || "",
      ref: (r: HTMLCanvasElement) => (this.htmlCanvasElementReference = r),
      style: {
        width: this.props.width || "800px",
        height: this.props.height || "600px",
      },
    });
  }
}
