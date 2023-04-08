import * as React from 'react';
import * as ReactRouter from 'react-router';

/**
 * Defines the API accessible from pilets.
 */
export interface PiletApi extends EventEmitter, PiletCustomApi, PiletCoreApi {
  /**
   * Gets the metadata of the current pilet.
   */
  meta: PiletMetadata;
}

/**
 * The emitter for Piral app shell events.
 */
export interface EventEmitter {
  /**
   * Attaches a new event listener.
   * @param type The type of the event to listen for.
   * @param callback The callback to trigger.
   */
  on<K extends keyof PiralEventMap>(type: K, callback: Listener<PiralEventMap[K]>): EventEmitter;
  /**
   * Detaches an existing event listener.
   * @param type The type of the event to listen for.
   * @param callback The callback to trigger.
   */
  off<K extends keyof PiralEventMap>(type: K, callback: Listener<PiralEventMap[K]>): EventEmitter;
  /**
   * Emits a new event with the given type.
   * @param type The type of the event to emit.
   * @param arg The payload of the event.
   */
  emit<K extends keyof PiralEventMap>(type: K, arg: PiralEventMap[K]): EventEmitter;
}

/**
 * Custom Pilet API parts defined outside of piral-core.
 */
export interface PiletCustomApi extends PiletLocaleApi, PiletDashboardApi, PiletMenuApi, PiletNotificationsApi, PiletModalsApi, PiletFeedsApi, PiletVueApi, PiletSvelteApi, PiletSolidApi, PiletNgApi {}

/**
 * Defines the Pilet API from piral-core.
 * This interface will be consumed by pilet developers so that their pilet can interact with the piral instance.
 */
export interface PiletCoreApi {
  /**
   * Gets a shared data value.
   * @param name The name of the data to retrieve.
   */
  getData<TKey extends string>(name: TKey): SharedData[TKey];
  /**
   * Sets the data using a given name. The name needs to be used exclusively by the current pilet.
   * Using the name occupied by another pilet will result in no change.
   * @param name The name of the data to store.
   * @param value The value of the data to store.
   * @param options The optional configuration for storing this piece of data.
   * @returns True if the data could be set, otherwise false.
   */
  setData<TKey extends string>(name: TKey, value: SharedData[TKey], options?: DataStoreOptions): boolean;
  /**
   * Registers a route for predefined page component.
   * The route needs to be unique and can contain params.
   * Params are following the path-to-regexp notation, e.g., :id for an id parameter.
   * @param route The route to register.
   * @param Component The component to render the page.
   * @param meta The optional metadata to use.
   */
  registerPage(route: string, Component: AnyComponent<PageComponentProps>, meta?: PiralPageMeta): RegistrationDisposer;
  /**
   * Unregisters the page identified by the given route.
   * @param route The route that was previously registered.
   */
  unregisterPage(route: string): void;
  /**
   * Registers an extension component with a predefined extension component.
   * The name must refer to the extension slot.
   * @param name The global name of the extension slot.
   * @param Component The component to be rendered.
   * @param defaults Optionally, sets the default values for the expected data.
   */
  registerExtension<TName>(name: TName extends string ? TName : string, Component: AnyExtensionComponent<TName>, defaults?: Partial<ExtensionParams<TName>>): RegistrationDisposer;
  /**
   * Unregisters a global extension component.
   * Only previously registered extension components can be unregistered.
   * @param name The name of the extension slot to unregister from.
   * @param Component The registered extension component to unregister.
   */
  unregisterExtension<TName>(name: TName extends string ? TName : string, Component: AnyExtensionComponent<TName>): void;
  /**
   * React component for displaying extensions for a given name.
   * @param props The extension's rendering props.
   * @return The created React element.
   */
  Extension<TName>(props: ExtensionSlotProps<TName>): React.ReactElement | null;
  /**
   * Renders an extension in a plain DOM component.
   * @param element The DOM element or shadow root as a container for rendering the extension.
   * @param props The extension's rendering props.
   * @return The disposer to clear the extension.
   */
  renderHtmlExtension<TName>(element: HTMLElement | ShadowRoot, props: ExtensionSlotProps<TName>): Disposable;
}

/**
 * Describes the metadata of a pilet available in its API.
 */
export interface PiletMetadata {
  /**
   * The name of the pilet, i.e., the package id.
   */
  name: string;
  /**
   * The version of the pilet. Should be semantically versioned.
   */
  version: string;
  /**
   * Provides the version of the specification for this pilet.
   */
  spec: string;
  /**
   * Provides some custom metadata for the pilet.
   */
  custom?: any;
  /**
   * Optionally indicates the global require reference, if any.
   */
  requireRef?: string;
  /**
   * Additional shared dependencies from the pilet.
   */
  dependencies: Record<string, string>;
  /**
   * Provides some configuration to be used in the pilet.
   */
  config: Record<string, any>;
  /**
   * The URL of the main script of the pilet.
   */
  link: string;
  /**
   * The base path to the pilet. Can be used to make resource requests
   * and override the public path.
   */
  basePath: string;
}

/**
 * Listener for Piral app shell events.
 */
export interface Listener<T> {
  /**
   * Receives an event of type T.
   */
  (arg: T): void;
}

/**
 * The map of known Piral app shell events.
 */
export interface PiralEventMap extends PiralCustomEventMap {
  "unload-pilet": PiralUnloadPiletEvent;
  [custom: string]: any;
  "store-data": PiralStoreDataEvent;
}

export interface PiletLocaleApi {
  /**
   * Adds a list of translations to the existing translations.
   * 
   * Internally, setTranslations is used, which means the translations will be exclusively used for
   * retrieving translations for the pilet.
   * @param messagesList The list of messages that extend the existing translations
   * @param isOverriding Indicates whether the new translations overwrite the existing translations
   */
  addTranslations(messagesList: Array<LocalizationMessages>, isOverriding?: boolean): void;
  /**
   * Gets the currently selected language directly.
   */
  getCurrentLanguage(): string;
  /**
   * Gets the currently selected language in a callback that is also invoked when the
   * selected language changes. Returns a disposable to stop the notifications.
   */
  getCurrentLanguage(cb: (currently: string) => void): Disposable;
  /**
   * Translates the given tag (using the optional variables) into a string using the current language.
   * The used template can contain placeholders in form of `{{variableName}}`.
   * @param tag The tag to translate.
   * @param variables The optional variables to fill into the temnplate.
   */
  translate<T = Record<string, string>>(tag: string, variables?: T): string;
  /**
   * Provides translations to the application.
   * The translations will be exclusively used for retrieving translations for the pilet.
   * @param messages The messages to use as translation basis.
   */
  setTranslations(messages: LocalizationMessages): void;
  /**
   * Gets the currently provided translations by the pilet.
   */
  getTranslations(): LocalizationMessages;
}

export interface PiletDashboardApi {
  /**
   * Registers a tile with a predefined tile components.
   * The name has to be unique within the current pilet.
   * @param name The name of the tile.
   * @param Component The component to be rendered within the Dashboard.
   * @param preferences The optional preferences to be supplied to the Dashboard for the tile.
   */
  registerTile(name: string, Component: AnyComponent<TileComponentProps>, preferences?: TilePreferences): RegistrationDisposer;
  /**
   * Registers a tile for predefined tile components.
   * @param Component The component to be rendered within the Dashboard.
   * @param preferences The optional preferences to be supplied to the Dashboard for the tile.
   */
  registerTile(Component: AnyComponent<TileComponentProps>, preferences?: TilePreferences): RegistrationDisposer;
  /**
   * Unregisters a tile known by the given name.
   * Only previously registered tiles can be unregistered.
   * @param name The name of the tile to unregister.
   */
  unregisterTile(name: string): void;
}

export interface PiletMenuApi {
  /**
   * Registers a menu item for a predefined menu component.
   * The name has to be unique within the current pilet.
   * @param name The name of the menu item.
   * @param Component The component to be rendered within the menu.
   * @param settings The optional configuration for the menu item.
   */
  registerMenu(name: string, Component: AnyComponent<MenuComponentProps>, settings?: MenuSettings): RegistrationDisposer;
  /**
   * Registers a menu item for a predefined menu component.
   * @param Component The component to be rendered within the menu.
   * @param settings The optional configuration for the menu item.
   */
  registerMenu(Component: AnyComponent<MenuComponentProps>, settings?: MenuSettings): RegistrationDisposer;
  /**
   * Unregisters a menu item known by the given name.
   * Only previously registered menu items can be unregistered.
   * @param name The name of the menu item to unregister.
   */
  unregisterMenu(name: string): void;
}

export interface PiletNotificationsApi {
  /**
   * Shows a notification in the determined spot using the provided content.
   * @param content The content to display. Normally, a string would be sufficient.
   * @param options The options to consider for showing the notification.
   * @returns A callback to trigger closing the notification.
   */
  showNotification(content: string | React.ReactElement<any, any> | AnyComponent<NotificationComponentProps>, options?: NotificationOptions): Disposable;
}

export interface PiletModalsApi {
  /**
   * Shows a modal dialog with the given name.
   * The modal can be optionally programmatically closed using the returned callback.
   * @param name The name of the registered modal.
   * @param options Optional arguments for creating the modal.
   * @returns A callback to trigger closing the modal.
   */
  showModal<T>(name: T extends string ? T : string, options?: ModalOptions<T>): Disposable;
  /**
   * Registers a modal dialog using a React component.
   * The name needs to be unique to be used without the pilet's name.
   * @param name The name of the modal to register.
   * @param Component The component to render the page.
   * @param defaults Optionally, sets the default values for the inserted options.
   * @param layout Optionally, sets the layout options for the dialog wrapper.
   */
  registerModal<T>(name: T extends string ? T : string, Component: AnyComponent<ModalComponentProps<T>>, defaults?: ModalOptions<T>, layout?: ModalLayoutOptions): RegistrationDisposer;
  /**
   * Unregisters a modal by its name.
   * @param name The name that was previously registered.
   */
  unregisterModal<T>(name: T extends string ? T : string): void;
}

export interface PiletFeedsApi {
  /**
   * Creates a connector for wrapping components with data relations.
   * @param resolver The resolver for the initial data set.
   */
  createConnector<T>(resolver: FeedResolver<T>): FeedConnector<T>;
  /**
   * Creates a connector for wrapping components with data relations.
   * @param options The options for creating the connector.
   */
  createConnector<TData, TItem, TReducers extends FeedConnectorReducers<TData>>(options: FeedConnectorOptions<TData, TItem, TReducers>): FeedConnector<TData, TReducers>;
}

/**
 * Defines the provided set of Vue Pilet API extensions.
 */
export interface PiletVueApi {
  /**
   * Wraps a Vue component for use in Piral.
   * @param component The root component.
   * @param captured The optionally captured props.
   * @returns The Piral Vue component.
   */
  fromVue<TProps>(component: Component<TProps>, captured?: Record<string, any>): VueComponent<TProps>;
  /**
   * Vue component for displaying extensions of the given name.
   */
  VueExtension: Component<ExtensionSlotProps>;
}

/**
 * Defines the provided set of Svelte Pilet API extensions.
 */
export interface PiletSvelteApi {
  /**
   * Wraps a Svelte module for use in Piral.
   * @param Component The name of the root component.
   * @param captured The optionally captured props.
   * @returns The Piral Svelte component.
   */
  fromSvelte<TProps>(Component: SvelteModule<TProps>, captured?: Record<string, any>): SvelteComponent<TProps>;
  /**
   * Gets the name of the Svelte extension.
   */
  SvelteExtension: string;
}

/**
 * Defines the provided set of Solid Pilet API extensions.
 */
export interface PiletSolidApi {
  /**
   * Wraps a Solid component for use in Piral.
   * @param component The name of the root component.
   * @returns The Piral Solid component.
   */
  fromSolid<TProps>(root: Component___1<TProps>): SolidComponent<TProps>;
  /**
   * Gets the name of the Solid extension.
   */
  SolidExtension: Component___1<ExtensionSlotProps>;
}

/**
 * Defines the provided set of Angular Pilet API extensions.
 */
export interface PiletNgApi {
  /**
   * Defines the module to use when bootstrapping the Angular pilet.
   */
  defineNgModule: NgModuleDefiner;
  /**
   * Wraps an Angular component for use in Piral. Might reuse a previously
   * defined module if the component was exported from it.
   * Alternatively, a module might be passed in, where the first component
   * of either the bootstrap or the entryComponents declaration is used.
   * @param component The component root.
   * @returns The Piral Ng component.
   */
  fromNg<T>(component: Type<T>): NgComponent;
  /**
   * Angular component for displaying extensions of the given name.
   */
  NgExtension: any;
}

/**
 * Defines the shape of the data store for storing shared data.
 */
export interface SharedData<TValue = any> {
  [key: string]: TValue;
}

/**
 * Defines the options to be used for storing data.
 */
export type DataStoreOptions = DataStoreTarget | CustomDataStoreOptions;

/**
 * Possible shapes for a component.
 */
export type AnyComponent<T> = React.ComponentType<T> | FirstParametersOf<ComponentConverters<T>>;

/**
 * The props used by a page component.
 */
export interface PageComponentProps<T extends {
  [K in keyof T]?: string;
} = {}, S = any> extends RouteBaseProps<T, S> {
  /**
   * The meta data registered with the page.
   */
  meta: PiralPageMeta;
  /**
   * The children of the page.
   */
  children: React.ReactNode;
}

/**
 * The meta data registered for a page.
 */
export interface PiralPageMeta extends PiralCustomPageMeta, PiralCustomPageMeta {}

/**
 * The shape of an implicit unregister function.
 */
export interface RegistrationDisposer {
  /**
   * Cleans up the previous registration.
   */
  (): void;
}

/**
 * Shorthand for the definition of an extension component.
 */
export type AnyExtensionComponent<TName> = TName extends keyof PiralExtensionSlotMap ? AnyComponent<ExtensionComponentProps<TName>> : TName extends string ? AnyComponent<ExtensionComponentProps<any>> : AnyComponent<ExtensionComponentProps<TName>>;

/**
 * Gives the extension params shape for the given extension slot name.
 */
export type ExtensionParams<TName> = TName extends keyof PiralExtensionSlotMap ? PiralExtensionSlotMap[TName] : TName extends string ? any : TName;

/**
 * The props for defining an extension slot.
 */
export type ExtensionSlotProps<TName = string> = BaseExtensionSlotProps<TName extends string ? TName : string, ExtensionParams<TName>>;

/**
 * Can be implemented by functions to be used for disposal purposes.
 */
export interface Disposable {
  /**
   * Disposes the created resource.
   */
  (): void;
}

/**
 * Custom events defined outside of piral-core.
 */
export interface PiralCustomEventMap {
  "select-language": PiralSelectLanguageEvent;
}

/**
 * Gets fired when a pilet gets unloaded.
 */
export interface PiralUnloadPiletEvent {
  /**
   * The name of the pilet to be unloaded.
   */
  name: string;
}

/**
 * Gets fired when a data item gets stored in piral.
 */
export interface PiralStoreDataEvent<TValue = any> {
  /**
   * The name of the item that was stored.
   */
  name: string;
  /**
   * The storage target of the item.
   */
  target: string;
  /**
   * The value that was stored.
   */
  value: TValue;
  /**
   * The owner of the item.
   */
  owner: string;
  /**
   * The expiration of the item.
   */
  expires: number;
}

export interface LocalizationMessages {
  [lang: string]: Translations;
}

export type TileComponentProps = BaseComponentProps & BareTileComponentProps;

export interface TilePreferences extends PiralCustomTilePreferences {
  /**
   * Sets the desired initial number of columns.
   * This may be overridden either by the user (if resizable true), or by the dashboard.
   */
  initialColumns?: number;
  /**
   * Sets the desired initial number of rows.
   * This may be overridden either by the user (if resizable true), or by the dashboard.
   */
  initialRows?: number;
  /**
   * Determines if the tile can be resized by the user.
   * By default the size of the tile is fixed.
   */
  resizable?: boolean;
  /**
   * Declares a set of custom properties to be used with user-specified values.
   */
  customProperties?: Array<string>;
}

export interface MenuComponentProps extends BaseComponentProps {}

export interface MenuSettings extends PiralCustomMenuSettings {
  /**
   * Sets the type of the menu to attach to.
   * @default "general"
   */
  type?: MenuType;
}

export type NotificationComponentProps = BaseComponentProps & BareNotificationProps;

export interface NotificationOptions extends PiralCustomNotificationOptions {
  /**
   * The title of the notification, if any.
   */
  title?: string;
  /**
   * Determines when the notification should automatically close in milliseconds.
   * A value of 0 or undefined forces the user to close the notification.
   */
  autoClose?: number;
  /**
   * The type of the notification used when displaying the message.
   * By default info is used.
   */
  type?: "info" | "success" | "warning" | "error";
}

export type ModalOptions<T> = T extends keyof PiralModalsMap ? PiralModalsMap[T] & BaseModalOptions : T extends string ? BaseModalOptions : T;

export type ModalComponentProps<T> = BaseComponentProps & BareModalComponentProps<ModalOptions<T>>;

/**
 * The options provided for the dialog layout.
 */
export interface ModalLayoutOptions {}

export interface FeedResolver<TData> {
  /**
   * Function to derive the initial set of data.
   * @returns The promise for retrieving the initial data set.
   */
  (): Promise<TData>;
}

export type FeedConnector<TData, TReducers = {}> = GetActions<TReducers> & {
  /**
   * Connector function for wrapping a component.
   * @param component The component to connect by providing a data prop.
   */
  <TProps>(component: React.ComponentType<TProps & FeedConnectorProps<TData>>): React.FC<TProps>;
  /**
   * Invalidates the underlying feed connector.
   * Forces a reload on next use.
   */
  invalidate(): void;
};

export interface FeedConnectorOptions<TData, TItem, TReducers extends FeedConnectorReducers<TData> = {}> {
  /**
   * Function to derive the initial set of data.
   * @returns The promise for retrieving the initial data set.
   */
  initialize: FeedResolver<TData>;
  /**
   * Function to be called for connecting to a live data feed.
   * @param callback The function to call when an item updated.
   * @returns A callback for disconnecting from the feed.
   */
  connect?: FeedSubscriber<TItem>;
  /**
   * Function to be called when some data updated.
   * @param data The current set of data.
   * @param item The updated item to include.
   * @returns The promise for retrieving the updated data set or the updated data set.
   */
  update?: FeedReducer<TData, TItem>;
  /**
   * Defines the optional reducers for modifying the data state.
   */
  reducers?: TReducers;
  /**
   * Optional flag to avoid lazy loading and initialize the data directly.
   */
  immediately?: boolean;
}

export interface FeedConnectorReducers<TData> {
  [name: string]: (data: TData, ...args: any) => Promise<TData> | TData;
}

export type Component<Data = DefaultData<never>, Methods = DefaultMethods<never>, Computed = DefaultComputed, Props = DefaultProps, SetupBindings = {}> = VueConstructor<Vue<Record<string, any>, Record<string, any>, never, never, (event: string, ...args: Array<any>) => Vue<Record<string, any>, Record<string, any>, never, never, any>>> | FunctionalComponentOptions<Props> | ComponentOptions<never, Data, Methods, Computed, Props, SetupBindings> | DefineComponent<any, any, any, any, any, any, any, any, any, any, any>;

export interface VueComponent<TProps> {
  /**
   * The root component of Vue rendering tree.
   */
  root: Component<TProps>;
  /**
   * The type of the Vue component.
   */
  type: "vue";
  /**
   * Captures props for transport into the Vue component.
   */
  captured?: Record<string, any>;
}

export interface SvelteModule<TProps> {
  new (opts: SvelteOptions<TProps>): SvelteComponentInstance<TProps>;
}

export interface SvelteComponent<TProps> {
  /**
   * The name of the Svelte main module to render.
   */
  Component: SvelteModule<TProps>;
  /**
   * Captures props for transport into the Svelte component.
   */
  captured?: Record<string, any>;
  /**
   * The type of the Svelte component.
   */
  type: "svelte";
}

export type Component___1<P = {}> = (props: PropsWithChildren<P>) => JSX.Element;

export interface SolidComponent<TProps> {
  /**
   * The component root.
   */
  root: Component___1<TProps>;
  /**
   * The type of the Solid component.
   */
  type: "solid";
}

/**
 * Represents the interface implemented by a module definer function.
 */
export interface NgModuleDefiner {
  /**
   * Defines the module to use when bootstrapping the Angular pilet.
   * @param ngModule The module to use for running Angular.
   * @param opts The options to pass when bootstrapping.
   */
  <T>(module: Type<T>, opts?: NgOptions): void;
  /**
   * Defines the module to lazy load for bootstrapping the Angular pilet.
   * @param getModule The module lazy loader to use for running Angular.
   * @param opts The options to pass when bootstrapping.
   * @returns The module ID to be used to reference components.
   */
  <T>(getModule: LazyType<T>, opts?: NgOptions): NgComponentLoader;
}

/**
 * @description Represents a type that a Component or other object is instances of.
 * 
 * An example of a `Type` is `MyCustomComponent` class, which in JavaScript is represented by
 * the `MyCustomComponent` constructor function.
 * @publicApi
 */
export const Type: FunctionConstructor;

export interface NgComponent {
  /**
   * The component root.
   */
  component: Type<any> | NgLazyType;
  /**
   * The type of the Angular component.
   */
  type: "ng";
}

/**
 * Defines the potential targets when storing data.
 */
export type DataStoreTarget = "memory" | "local" | "remote";

/**
 * Defines the custom options for storing data.
 */
export interface CustomDataStoreOptions {
  /**
   * The target data store. By default the data is only stored in memory.
   */
  target?: DataStoreTarget;
  /**
   * Optionally determines when the data expires.
   */
  expires?: "never" | Date | number;
}

export type FirstParametersOf<T> = {
  [K in keyof T]: T[K] extends (arg: any) => any ? FirstParameter<T[K]> : never;
}[keyof T];

/**
 * Mapping of available component converters.
 */
export interface ComponentConverters<TProps> extends PiralCustomComponentConverters<TProps> {
  /**
   * Converts the HTML component to a framework-independent component.
   * @param component The vanilla JavaScript component to be converted.
   */
  html(component: HtmlComponent<TProps>): ForeignComponent<TProps>;
}

/**
 * The props that every registered page component obtains.
 */
export interface RouteBaseProps<UrlParams extends {
  [K in keyof UrlParams]?: string;
} = {}, UrlState = any> extends ReactRouter.RouteComponentProps<UrlParams, {}, UrlState>, BaseComponentProps {}

/**
 * Custom meta data to include for pages.
 */
export interface PiralCustomPageMeta {}

/**
 * The props of an extension component.
 */
export interface ExtensionComponentProps<T> extends BaseComponentProps {
  /**
   * The provided parameters for showing the extension.
   */
  params: T extends keyof PiralExtensionSlotMap ? PiralExtensionSlotMap[T] : T extends string ? any : T;
  /**
   * The optional children to receive, if any.
   */
  children?: React.ReactNode;
}

/**
 * The mapping of the existing (known) extension slots.
 */
export interface PiralExtensionSlotMap extends PiralCustomExtensionSlotMap {}

/**
 * The basic props for defining an extension slot.
 */
export interface BaseExtensionSlotProps<TName, TParams> {
  /**
   * The children to transport, if any.
   */
  children?: React.ReactNode;
  /**
   * Defines what should be rendered when no components are available
   * for the specified extension.
   */
  empty?(): React.ReactNode;
  /**
   * Determines if the `render` function should be called in case no
   * components are available for the specified extension.
   * 
   * If true, `empty` will be called and returned from the slot.
   * If false, `render` will be called with the result of calling `empty`.
   * The result of calling `render` will then be returned from the slot.
   */
  emptySkipsRender?: boolean;
  /**
   * Defines the order of the components to render.
   * May be more convient than using `render` w.r.t. ordering extensions
   * by their supplied metadata.
   * @param extensions The registered extensions.
   * @returns The ordered extensions.
   */
  order?(extensions: Array<ExtensionRegistration>): Array<ExtensionRegistration>;
  /**
   * Defines how the provided nodes should be rendered.
   * @param nodes The rendered extension nodes.
   * @returns The rendered nodes, i.e., an ReactElement.
   */
  render?(nodes: Array<React.ReactNode>): React.ReactElement<any, any> | null;
  /**
   * The custom parameters for the given extension.
   */
  params?: TParams;
  /**
   * The name of the extension to render.
   */
  name: TName;
}

export interface PiralSelectLanguageEvent {
  /**
   * Gets the previously selected language.
   */
  previousLanguage: string;
  /**
   * Gets the currently selected language.
   */
  currentLanguage: string;
}

export interface Translations {
  [tag: string]: string;
}

/**
 * The props that every registered component obtains.
 */
export interface BaseComponentProps {
  /**
   * The currently used pilet API.
   */
  piral: PiletApi;
}

export interface BareTileComponentProps {
  /**
   * The currently used number of columns.
   */
  columns: number;
  /**
   * The currently used number of rows.
   */
  rows: number;
}

export interface PiralCustomTilePreferences {}

export interface PiralCustomMenuSettings {}

export type MenuType = StandardMenuType | keyof PiralCustomMenuTypes;

export interface BareNotificationProps {
  /**
   * Callback for closing the notification programmatically.
   */
  onClose(): void;
  /**
   * Provides the passed in options for this particular notification.
   */
  options: NotificationOptions;
}

export interface PiralCustomNotificationOptions {}

export interface BaseModalOptions {}

export interface PiralModalsMap extends PiralCustomModalsMap {}

export interface BareModalComponentProps<TOpts> {
  /**
   * Callback for closing the modal programmatically.
   */
  onClose(): void;
  /**
   * Provides the passed in options for this particular modal.
   */
  options?: TOpts;
}

export type GetActions<TReducers> = {
  [P in keyof TReducers]: (...args: RemainingArgs<TReducers[P]>) => void;
};

export interface FeedConnectorProps<TData> {
  /**
   * The current data from the feed.
   */
  data: TData;
}

export interface FeedSubscriber<TItem> {
  (callback: (value: TItem) => void): Disposable;
}

export interface FeedReducer<TData, TAction> {
  (data: TData, item: TAction): Promise<TData> | TData;
}

export interface VueConstructor<V extends Vue = Vue> {
  /**
   * new with array props
   * new with object props
   * ideally, the return type should just contain Props,
   * not Record<keyof Props, any>. But TS requires to have Base constructors
   * with the same return type.
   * new with no props
   */
  new <Data = object, Methods = object, Computed = object, PropNames extends string = never, SetupBindings = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin>(options?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames, SetupBindings, Mixin, Extends>): CombinedVueInstance<V, Data, Methods, Computed, Record<PropNames, any>, SetupBindings, Mixin, Extends>;
  /**
   * extend with array props
   */
  extend<Data, Methods, Computed, PropNames extends string = never, SetupBindings = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin>(options?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames, SetupBindings, Mixin, Extends>): ExtendedVue<V, Data, Methods, Computed, Record<PropNames, any>, SetupBindings, Mixin, Extends>;
  /**
   * extend with object props
   */
  extend<Data, Methods, Computed, Props, SetupBindings = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin>(options?: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props, SetupBindings, Mixin, Extends>): ExtendedVue<V, Data, Methods, Computed, Props, SetupBindings, Mixin, Extends>;
  /**
   * extend with functional + array props
   */
  extend<PropNames extends string = never>(definition: FunctionalComponentOptions<Record<PropNames, any>, Array<PropNames>>): ExtendedVue<V, {}, {}, {}, Record<PropNames, any>, {}>;
  /**
   * extend with functional + object props
   */
  extend<Props>(definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>): ExtendedVue<V, {}, {}, {}, Props, {}>;
  /**
   * extend with no props
   */
  extend(options?: ComponentOptions<V>): ExtendedVue<V, {}, {}, {}, {}, {}>;
  nextTick<T>(callback: (this: T) => void, context?: T): void;
  nextTick(): Promise<void>;
  set<T>(object: object, key: string | number, value: T): T;
  set<T>(array: Array<T>, key: number, value: T): T;
  delete(object: object, key: string | number): void;
  delete<T>(array: Array<T>, key: number): void;
  directive(id: string, definition?: DirectiveOptions | DirectiveFunction): DirectiveOptions;
  directive(id: string, definition?: Directive): ObjectDirective;
  filter(id: string, definition?: Function): Function;
  component(id: string): VueConstructor;
  component<VC extends VueConstructor>(id: string, constructor: VC): VC;
  component<Data, Methods, Computed, Props, SetupBindings>(id: string, definition: AsyncComponent<Data, Methods, Computed, Props>): ExtendedVue<V, Data, Methods, Computed, Props, SetupBindings>;
  component<Data, Methods, Computed, PropNames extends string = never, SetupBindings = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin>(id: string, definition?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames, SetupBindings, Mixin, Extends>): ExtendedVue<V, Data, Methods, Computed, Record<PropNames, any>, SetupBindings, Mixin, Extends>;
  component<Data, Methods, Computed, Props, SetupBindings, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin>(id: string, definition?: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props, SetupBindings, Mixin, Extends>): ExtendedVue<V, Data, Methods, Computed, Props, SetupBindings>;
  component<PropNames extends string>(id: string, definition: FunctionalComponentOptions<Record<PropNames, any>, Array<PropNames>>): ExtendedVue<V, {}, {}, {}, Record<PropNames, any>, {}>;
  component<Props>(id: string, definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>): ExtendedVue<V, {}, {}, {}, Props, {}>;
  component(id: string, definition?: ComponentOptions<V>): ExtendedVue<V, {}, {}, {}, {}, {}>;
  component<T extends DefineComponent<any, any, any, any, any, any, any, any>>(id: string, definition?: T): T;
  use<T>(plugin: PluginObject<T> | PluginFunction<T>, options?: T): VueConstructor<V>;
  use(plugin: PluginObject<any> | PluginFunction<any>, ...options: Array<any>): VueConstructor<V>;
  mixin(mixin: VueConstructor | ComponentOptions<Vue>): VueConstructor<V>;
  compile(template: string): {
    render(createElement: typeof Vue.prototype.$createElement): VNode;
    staticRenderFns: Array<(() => VNode)>;
  };
  observable<T>(obj: T): T;
  util: {
    warn(msg: string, vm?: InstanceType<VueConstructor>): void;
  };
  config: VueConfiguration;
  version: string;
}

export const Vue: VueConstructor;

export interface FunctionalComponentOptions<Props = DefaultProps, PropDefs = PropsDefinition<Props>> {
  name?: string;
  props?: PropDefs;
  model?: {
    prop?: string;
    event?: string;
  };
  inject?: InjectOptions;
  functional: boolean;
  render?(this: undefined, createElement: CreateElement, context: RenderContext<Props>): VNode | Array<VNode>;
}

export interface ComponentOptions<V extends Vue, Data = DefaultData<V>, Methods = DefaultMethods<V>, Computed = DefaultComputed, PropsDef = PropsDefinition<DefaultProps>, Props = DefaultProps, RawBindings = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin> {
  data?: Data;
  props?: PropsDef;
  propsData?: object;
  computed?: Accessors<Computed>;
  methods?: Methods;
  watch?: Record<string, WatchOptionsWithHandler<any> | WatchHandler<any> | Array<WatchOptionsWithHandler<any> | WatchHandler<any>>>;
  setup?(this: void, props: Props, ctx: SetupContext): Promise<RawBindings> | RawBindings | ((h: CreateElement) => VNode) | void;
  el?: Element | string;
  template?: string;
  render?(createElement: CreateElement, hack: RenderContext<Props>): VNode | null | void;
  renderError?(createElement: CreateElement, err: Error): VNode;
  staticRenderFns?: Array<((createElement: CreateElement) => VNode)>;
  beforeCreate?(this: V): void;
  created?(): void;
  beforeDestroy?(): void;
  destroyed?(): void;
  beforeMount?(): void;
  mounted?(): void;
  beforeUpdate?(): void;
  updated?(): void;
  activated?(): void;
  deactivated?(): void;
  errorCaptured?(err: Error, vm: Vue, info: string): boolean | void;
  serverPrefetch?(this: V): Promise<void>;
  renderTracked?(e: DebuggerEvent): void;
  renderTriggerd?(e: DebuggerEvent): void;
  directives?: {
    [key: string]: DirectiveFunction | DirectiveOptions;
  };
  components?: {
    [key: string]: {} | Component<any, any, any, any, any> | AsyncComponent<any, any, any, any>;
  };
  transitions?: {
    [key: string]: object;
  };
  filters?: {
    [key: string]: Function;
  };
  provide?: object | (() => object);
  inject?: InjectOptions;
  model?: {
    prop?: string;
    event?: string;
  };
  parent?: Vue;
  mixins?: Array<(Mixin | ComponentOptions<Vue> | VueConstructor<Vue<Record<string, any>, Record<string, any>, never, never, (event: string, ...args: Array<any>) => Vue<Record<string, any>, Record<string, any>, never, never, any>>>)>;
  name?: string;
  __name?: string;
  extends?: Extends | ComponentOptions<Vue> | VueConstructor<Vue<Record<string, any>, Record<string, any>, never, never, (event: string, ...args: Array<any>) => Vue<Record<string, any>, Record<string, any>, never, never, any>>>;
  delimiters?: [string, string];
  comments?: boolean;
  inheritAttrs?: boolean;
}

export type DefineComponent<PropsOrPropOptions = {}, RawBindings = {}, D = {}, C extends ComputedOptions = ComputedOptions, M extends MethodOptions = MethodOptions, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = {}, EE extends string = string, Props = Readonly<PropsOrPropOptions extends ComponentPropsOptions ? ExtractPropTypes<PropsOrPropOptions> : PropsOrPropOptions>, Defaults = ExtractDefaultPropTypes<PropsOrPropOptions>> = ComponentPublicInstanceConstructor<CreateComponentPublicInstance<Props, RawBindings, D, C, M, Mixin, Extends, E, Props, Defaults, true> & Props> & ComponentOptionsBase<Props, RawBindings, D, C, M, Mixin, Extends, E, EE, Defaults> & {
  props: PropsOrPropOptions;
};

export type DefaultData<V> = object | ((this: V) => object);

export type DefaultMethods<V> = {
  [key: string]: (this: V, ...args: Array<any>) => any;
};

export type DefaultComputed = {
  [key: string]: any;
};

export type DefaultProps = Record<string, any>;

export interface SvelteOptions<TProps> {
  target: Element;
  props: TProps;
}

export type SvelteComponentInstance<TProps> = TProps & {
  $destroy(): void;
};

export type PropsWithChildren<P> = P & {
  children?: JSX.Element;
};

/**
 * Options passed through to Angular `bootstrapModule`.
 * 
 * Mainly to specify Noop Zone, but also includes compiler specific settings.
 * See https://angular.io/api/core/PlatformRef#bootstrapModule for possible values.
 */
export type NgOptions = Parameters<PlatformRef["bootstrapModule"]>[1];

/**
 * The lazy loading interface for retrieving Angular components.
 */
export interface LazyType<T> {
  /**
   * Callback to be invoked for lazy loading an Angular module or component.
   */
  (): Promise<{
    default: Type<T>;
  }>;
}

/**
 * Gives you the ability to use a component from a lazy loaded module.
 */
export interface NgComponentLoader {
  /**
   * Uses a component from a lazy loaded module.
   * @param selector The selector defined for the component to load.
   */
  (selector: string): NgComponent;
}

export interface NgLazyType {
  selector: string;
  module(): Promise<{
    default: Type<any>;
  }>;
  opts: NgOptions;
  state: any;
}

export type FirstParameter<T extends (arg: any) => any> = T extends (arg: infer P) => any ? P : never;

/**
 * Custom component converters defined outside of piral-core.
 */
export interface PiralCustomComponentConverters<TProps> {
  vue(component: VueComponent<TProps>): ForeignComponent<TProps>;
  svelte(component: SvelteComponent<TProps>): ForeignComponent<TProps>;
  solid(component: SolidComponent<TProps>): ForeignComponent<TProps>;
  ng(component: NgComponent): ForeignComponent<TProps>;
}

/**
 * Definition of a vanilla JavaScript component.
 */
export interface HtmlComponent<TProps> {
  /**
   * Renders a component into the provided element using the given props and context.
   */
  component: ForeignComponent<TProps>;
  /**
   * The type of the HTML component.
   */
  type: "html";
}

/**
 * Generic definition of a framework-independent component.
 */
export interface ForeignComponent<TProps> {
  /**
   * Called when the component is mounted.
   * @param element The container hosting the element.
   * @param props The props to transport.
   * @param ctx The associated context.
   * @param locals The local state of this component instance.
   */
  mount(element: HTMLElement, props: TProps, ctx: ComponentContext, locals: Record<string, any>): void;
  /**
   * Called when the component should be updated.
   * @param element The container hosting the element.
   * @param props The props to transport.
   * @param ctx The associated context.
   * @param locals The local state of this component instance.
   */
  update?(element: HTMLElement, props: TProps, ctx: ComponentContext, locals: Record<string, any>): void;
  /**
   * Called when a component is unmounted.
   * @param element The container that was hosting the element.
   * @param locals The local state of this component instance.
   */
  unmount?(element: HTMLElement, locals: Record<string, any>): void;
}

/**
 * Custom extension slots outside of piral-core.
 */
export interface PiralCustomExtensionSlotMap {}

/**
 * The interface modeling the registration of a pilet extension component.
 */
export interface ExtensionRegistration extends BaseRegistration {
  /**
   * The wrapped registered extension component.
   */
  component: WrappedComponent<ExtensionComponentProps<string>>;
  /**
   * The original extension component that has been registered.
   */
  reference: any;
  /**
   * The default params (i.e., meta) of the extension.
   */
  defaults: any;
}

export type StandardMenuType = "general" | "admin" | "user" | "header" | "footer";

export interface PiralCustomMenuTypes {}

export interface PiralCustomModalsMap {}

export type RemainingArgs<T> = T extends (_: any, ...args: infer U) => any ? U : never;

/**
 * This type should be used when an array of strings is used for a component's `props` value.
 */
export type ThisTypedComponentOptionsWithArrayProps<V extends Vue, Data, Methods, Computed, PropNames extends string, SetupBindings, Mixin extends ComponentOptionsMixin, Extends extends ComponentOptionsMixin> = object & ComponentOptions<V, DataDef<Data, Record<PropNames, any>, V>, Methods, Computed, Array<PropNames>, Record<PropNames, any>, SetupBindings, Mixin, Extends> & ThisType<CombinedVueInstance<V, Data, Methods, Computed, Readonly<Record<PropNames, any>>, SetupBindings, Mixin, Extends>>;

export type CombinedVueInstance<Instance extends Vue, Data, Methods, Computed, Props, SetupBindings = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, PublicMixin = IntersectionMixin<Mixin> & IntersectionMixin<Extends>> = UnwrapNestedRefs<UnwrapMixinsType<PublicMixin, "D">> & Data & UnwrapMixinsType<PublicMixin, "M"> & Methods & ExtractComputedReturns<UnwrapMixinsType<PublicMixin, "C">> & Computed & UnwrapMixinsType<PublicMixin, "P"> & Props & Instance & ShallowUnwrapRef<UnwrapMixinsType<PublicMixin, "B">> & (SetupBindings extends void ? {} : SetupBindings);

export type ComponentOptionsMixin = ComponentOptionsBase<any, any, any, any, any, any, any, any, any, any>;

export type ExtendedVue<Instance extends Vue, Data, Methods, Computed, Props, SetupBindings = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin> = VueConstructor<CombinedVueInstance<Instance, Data, Methods, Computed, Props, SetupBindings, Mixin, Extends> & Vue>;

/**
 * This type should be used when an object mapped to `PropOptions` is used for a component's `props` value.
 */
export type ThisTypedComponentOptionsWithRecordProps<V extends Vue, Data, Methods, Computed, Props, SetupBindings, Mixin extends ComponentOptionsMixin, Extends extends ComponentOptionsMixin> = object & ComponentOptions<V, DataDef<Data, Props, V>, Methods, Computed, RecordPropsDefinition<Props>, Props, SetupBindings, Mixin, Extends> & ThisType<CombinedVueInstance<V, Data, Methods, Computed, Readonly<Props>, SetupBindings, Mixin, Extends>>;

export type RecordPropsDefinition<T> = {
  [K in keyof T]: PropValidator<T[K]>;
};

/**
 * @deprecated use {@link ObjectDirective } instead
 */
export interface DirectiveOptions {
  bind?: DirectiveFunction;
  inserted?: DirectiveFunction;
  update?: DirectiveFunction;
  componentUpdated?: DirectiveFunction;
  unbind?: DirectiveFunction;
}

/**
 * @deprecated use {@link FunctionDirective } instead
 */
export type DirectiveFunction = (el: HTMLElement, binding: DirectiveBinding, vnode: VNode, oldVnode: VNode) => void;

export type Directive<T = any, V = any> = ObjectDirective<T, V> | FunctionDirective<T, V>;

export interface ObjectDirective<T = any, V = any> {
  bind?: DirectiveHook<T, any, V>;
  inserted?: DirectiveHook<T, any, V>;
  update?: DirectiveHook<T, any, V>;
  componentUpdated?: DirectiveHook<T, any, V>;
  unbind?: DirectiveHook<T, any, V>;
}

export type AsyncComponent<Data = DefaultData<never>, Methods = DefaultMethods<never>, Computed = DefaultComputed, Props = DefaultProps, SetupBindings = {}> = AsyncComponentPromise<Data, Methods, Computed, Props, SetupBindings> | AsyncComponentFactory<Data, Methods, Computed, Props, SetupBindings>;

export interface PluginObject<T> {
  install: PluginFunction<T>;
  [key: string]: any;
}

export type PluginFunction<T> = (Vue: VueConstructor<Vue<Record<string, any>, Record<string, any>, never, never, (event: string, ...args: Array<any>) => Vue<Record<string, any>, Record<string, any>, never, never, any>>>, options?: T) => void;

export interface VNode {
  tag?: string;
  data?: VNodeData;
  children?: Array<VNode>;
  text?: string;
  elm?: Node;
  ns?: string;
  context?: Vue;
  key?: string | number | symbol | boolean;
  componentOptions?: VNodeComponentOptions;
  componentInstance?: Vue;
  parent?: VNode;
  raw?: boolean;
  isStatic?: boolean;
  isRootInsert: boolean;
  isComment: boolean;
}

export interface VueConfiguration {
  silent: boolean;
  optionMergeStrategies: any;
  devtools: boolean;
  productionTip: boolean;
  performance: boolean;
  errorHandler(err: Error, vm: Vue, info: string): void;
  warnHandler(msg: string, vm: Vue, trace: string): void;
  ignoredElements: Array<(string | RegExp)>;
  keyCodes: {
    [key: string]: number | Array<number>;
  };
  async: boolean;
}

export type InjectOptions = {
  [key: string]: InjectKey | {
    from?: InjectKey;
    default?: any;
  };
} | Array<string>;

export interface CreateElement {
  (tag?: string | Component<any, any, any, any> | AsyncComponent<any, any, any, any> | (() => Component), children?: VNodeChildren): VNode;
  (tag?: string | Component<any, any, any, any> | AsyncComponent<any, any, any, any> | (() => Component), data?: VNodeData, children?: VNodeChildren): VNode;
}

export interface RenderContext<Props = DefaultProps> {
  props: Props;
  children: Array<VNode>;
  slots(): any;
  data: VNodeData;
  parent: Vue;
  listeners: {
    [key: string]: Function | Array<Function>;
  };
  scopedSlots: {
    [key: string]: NormalizedScopedSlot;
  };
  injections: any;
}

export type PropsDefinition<T> = ArrayPropsDefinition<T> | RecordPropsDefinition<T>;

/**
 * When the `Computed` type parameter on `ComponentOptions` is inferred,
 * it should have a property with the return type of every get-accessor.
 * Since there isn't a way to query for the return type of a function, we allow TypeScript
 * to infer from the shape of `Accessors<Computed>` and work backwards.
 */
export type Accessors<T> = {
  [K in keyof T]: (() => T[K]) | ComputedOptions___1<T[K]>;
};

export interface WatchOptionsWithHandler<T> extends WatchOptions {
  handler: WatchHandler<T>;
}

export type WatchHandler<T> = string | ((val: T, oldVal: T) => void);

export interface SetupContext<E extends EmitsOptions = {}> {
  attrs: Data;
  /**
   * Equivalent of `this.$listeners`, which is Vue 2 only.
   */
  listeners: Record<string, Function | Array<Function>>;
  slots: Slots;
  emit: EmitFn<E>;
  expose(exposed?: Record<string, any>): void;
}

export type DebuggerEvent = {} & DebuggerEventExtraInfo;

export type ComponentPublicInstanceConstructor<T extends ComponentPublicInstance<Props, RawBindings, D, C, M> = ComponentPublicInstance<any, any, any>, Props = any, RawBindings = any, D = any, C extends ComputedOptions = ComputedOptions, M extends MethodOptions = MethodOptions> = {
  new (...args: Array<any>): T;
};

export type CreateComponentPublicInstance<P = {}, B = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = {}, PublicProps = P, Defaults = {}, MakeDefaultsOptional extends boolean = false, PublicMixin = IntersectionMixin<Mixin> & IntersectionMixin<Extends>, PublicP = UnwrapMixinsType<PublicMixin, "P"> & EnsureNonVoid<P>, PublicB = UnwrapMixinsType<PublicMixin, "B"> & EnsureNonVoid<B>, PublicD = UnwrapMixinsType<PublicMixin, "D"> & EnsureNonVoid<D>, PublicC extends ComputedOptions = UnwrapMixinsType<PublicMixin, "C"> & EnsureNonVoid<C>, PublicM extends MethodOptions = UnwrapMixinsType<PublicMixin, "M"> & EnsureNonVoid<M>, PublicDefaults = UnwrapMixinsType<PublicMixin, "Defaults"> & EnsureNonVoid<Defaults>> = ComponentPublicInstance<PublicP, PublicB, PublicD, PublicC, PublicM, E, PublicProps, PublicDefaults, MakeDefaultsOptional>;

export interface ComponentOptionsBase<Props, RawBindings, D, C extends ComputedOptions, M extends MethodOptions, Mixin extends ComponentOptionsMixin, Extends extends ComponentOptionsMixin, Emits extends EmitsOptions, EmitNames extends string = string, Defaults = {}> extends Omit<ComponentOptions<Vue, D, M, C, Props>, "data" | "computed" | "methods" | "setup" | "props" | "mixins" | "extends">, ComponentCustomOptions {
  [key: string]: any;
  data?(this: CreateComponentPublicInstance<Props, {}, {}, {}, M, Mixin, Extends>, vm: CreateComponentPublicInstance<Props, {}, {}, {}, M, Mixin, Extends>): D;
  computed?: C;
  methods?: M;
  mixins?: Array<Mixin>;
  extends?: Extends;
  emits?: (Emits | Array<EmitNames>) & ThisType<void>;
  setup?: SetupFunction<Readonly<LooseRequired<Props & UnionToIntersection<ExtractOptionProp<Mixin>> & UnionToIntersection<ExtractOptionProp<Extends>>>>, RawBindings, Emits>;
  __defaults?: Defaults;
}

export type ComputedOptions = Record<string, ComputedGetter<any> | WritableComputedOptions<any>>;

export interface MethodOptions {
  [key: string]: Function;
}

export type EmitsOptions = ObjectEmitsOptions | Array<string>;

export type ComponentPropsOptions<P = Data> = ComponentObjectPropsOptions<P> | Array<string>;

export type ExtractPropTypes<O> = {
  [K in keyof Pick<O, RequiredKeys<O>>]: InferPropType<O[K]>;
} & {
  [K in keyof Pick<O, OptionalKeys<O>>]?: InferPropType<O[K]>;
};

export type ExtractDefaultPropTypes<O> = O extends object ? {
  [K in keyof Pick<O, DefaultKeys<O>>]: InferPropType<O[K]>;
} : {};

export class PlatformRef {
  private _injector: any;
  private _modules: any;
  private _destroyListeners: any;
  private _destroyed: any;
  /**
   * Creates an instance of an `@NgModule` for the given platform.
   * @deprecated Passing NgModule factories as the `PlatformRef.bootstrapModuleFactory` function
   * argument is deprecated. Use the `PlatformRef.bootstrapModule` API instead.
   */
  bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>, options?: BootstrapOptions): Promise<NgModuleRef<M>>;
  /**
   * Creates an instance of an `@NgModule` for a given platform.
   * @usageNotes ### Simple Example
   * 
   * ```typescript
   * @NgModule ({
   * imports: [BrowserModule]
   * })
   * class MyModule {}
   * 
   * let moduleRef = platformBrowser().bootstrapModule(MyModule);
   * ```
   */
  bootstrapModule<M>(moduleType: Type<M>, compilerOptions?: (CompilerOptions & BootstrapOptions) | Array<CompilerOptions & BootstrapOptions>): Promise<NgModuleRef<M>>;
  private _moduleDoBootstrap: any;
  /**
   * Registers a listener to be called when the platform is destroyed.
   */
  onDestroy(callback: () => void): void;
  /**
   * Retrieves the platform {@link Injector}, which is the parent injector for
   * every Angular application on the page and provides singleton providers.
   */
  get injector(): Injector;
  /**
   * Destroys the current Angular platform and all Angular applications on the page.
   * Destroys all modules and listeners registered with the platform.
   */
  destroy(): void;
  /**
   * Indicates whether this instance was destroyed.
   */
  get destroyed(): boolean;
  static "ɵfac": ɵɵFactoryDeclaration<PlatformRef, never>;
  static "ɵprov": ɵɵInjectableDeclaration<PlatformRef>;
}

/**
 * The context to be transported into the generic components.
 */
export interface ComponentContext {
  /**
   * The router-independent navigation API.
   */
  navigation: NavigationApi;
  /**
   * The internal router object.
   * @deprecated Exposes internals that can change at any time.
   */
  router: any;
  /**
   * The public path of the application.
   */
  publicPath: string;
}

/**
 * The base type for pilet component registration in the global state context.
 */
export interface BaseRegistration {
  /**
   * The pilet registering the component.
   */
  pilet: string;
}

export type WrappedComponent<TProps> = React.ComponentType<React.PropsWithChildren<Without<TProps, keyof BaseComponentProps>>>;

export type DataDef<Data, Props, V> = Data | ((this: Readonly<Props> & V) => Data);

export type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRefSimple<T>;

export type UnwrapMixinsType<T, Type extends OptionTypesKeys> = T extends OptionTypesType ? T[Type] : never;

export type ExtractComputedReturns<T extends any> = {
  [key in keyof T]: T[key] extends {
    get(...args: Array<any>): infer TReturn;
  } ? TReturn : T[key] extends (...args: Array<any>) => infer TReturn ? TReturn : never;
};

export type ShallowUnwrapRef<T> = {
  [K in keyof T]: T[K] extends Ref<infer V> ? V : T[K] extends Ref<infer V> | undefined ? unknown extends V ? undefined : V | undefined : T[K];
};

export type IntersectionMixin<T> = IsDefaultMixinComponent<T> extends true ? OptionTypesType<{}, {}, {}, {}, {}, {}> : UnionToIntersection<ExtractMixin<T>>;

export type PropValidator<T> = PropOptions<T> | PropType<T>;

export interface DirectiveBinding extends Readonly<VNodeDirective> {
  readonly modifiers: {
    [key: string]: boolean;
  };
}

export type FunctionDirective<T = any, V = any> = DirectiveHook<T, any, V>;

export type DirectiveHook<T = any, Prev = VNode | null, V = any> = (el: T, binding: DirectiveBinding___1<V>, vnode: VNode, prevVNode: Prev) => void;

export type AsyncComponentPromise<Data = DefaultData<never>, Methods = DefaultMethods<never>, Computed = DefaultComputed, Props = DefaultProps, SetupBindings = {}> = (resolve: (component: Component<Data, Methods, Computed, Props, SetupBindings>) => void, reject: (reason?: any) => void) => Promise<ImportedComponent<Data, Methods, Computed, Props, SetupBindings>> | void;

export type AsyncComponentFactory<Data = DefaultData<never>, Methods = DefaultMethods<never>, Computed = DefaultComputed, Props = DefaultProps, SetupBindings = {}> = () => {
  component: Promise<ImportedComponent<Data, Methods, Computed, Props, SetupBindings>>;
  loading?: ImportedComponent;
  error?: ImportedComponent;
  delay?: number;
  timeout?: number;
};

export interface VNodeData {
  key?: string | number;
  slot?: string;
  scopedSlots?: {
    [key: string]: ScopedSlot | undefined;
  };
  ref?: VNodeRef;
  refInFor?: boolean;
  tag?: string;
  staticClass?: string;
  class?: any;
  staticStyle?: {
    [key: string]: any;
  };
  style?: StyleValue;
  props?: {
    [key: string]: any;
  };
  attrs?: {
    [key: string]: any;
  };
  domProps?: {
    [key: string]: any;
  };
  hook?: {
    [key: string]: Function;
  };
  on?: {
    [key: string]: Function | Array<Function>;
  };
  nativeOn?: {
    [key: string]: Function | Array<Function>;
  };
  transition?: object;
  show?: boolean;
  inlineTemplate?: {
    render: Function;
    staticRenderFns: Array<Function>;
  };
  directives?: Array<VNodeDirective>;
  keepAlive?: boolean;
}

export interface VNodeComponentOptions {
  Ctor: VueConstructor<Vue<Record<string, any>, Record<string, any>, never, never, (event: string, ...args: Array<any>) => Vue<Record<string, any>, Record<string, any>, never, never, any>>>;
  propsData?: object;
  listeners?: object;
  children?: Array<VNode>;
  tag?: string;
}

export type InjectKey = string | symbol;

export type VNodeChildren = VNodeChildrenArrayContents | [ScopedSlot] | string | boolean | null | undefined;

export type NormalizedScopedSlot = (props: any) => ScopedSlotChildren;

export type ArrayPropsDefinition<T> = Array<(keyof T)>;

export interface ComputedOptions___1<T> {
  get?(): T;
  set?(value: T): void;
  cache?: boolean;
}

export interface WatchOptions {
  deep?: boolean;
  immediate?: boolean;
}

export type Data = {
  [key: string]: unknown;
};

export type Slots = Record<string, Slot | undefined>;

export type EmitFn<Options = ObjectEmitsOptions, Event extends keyof Options = keyof Options, ReturnType extends void | Vue = void> = Options extends Array<infer V> ? (event: V, ...args: Array<any>) => ReturnType : {} extends Options ? (event: string, ...args: Array<any>) => ReturnType : UnionToIntersection<{
  [key in Event]: Options[key] extends (...args: infer Args) => any ? (event: key, ...args: Args) => ReturnType : (event: key, ...args: Array<any>) => ReturnType;
}[Event]>;

export type DebuggerEventExtraInfo = {
  target: object;
  type: TrackOpTypes | TriggerOpTypes;
  key?: any;
  newValue?: any;
  oldValue?: any;
};

export type ComponentPublicInstance<P = {}, B = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions = {}, E extends EmitsOptions = {}, PublicProps = P, Defaults = {}, MakeDefaultsOptional extends boolean = false, Options = ComponentOptionsBase<any, any, any, any, any, any, any, any, any, any>> = Vue3Instance<D, P, PublicProps, E, Defaults, MakeDefaultsOptional, Options> & Readonly<P> & ShallowUnwrapRef<B> & UnwrapNestedRefs<D> & ExtractComputedReturns<C> & M & ComponentCustomProperties;

export type EnsureNonVoid<T> = T extends void ? {} : T;

/**
 * Interface for declaring custom options.
 * @example
 * ```ts
 * declare module 'vue' {
 *   interface ComponentCustomOptions {
 *     beforeRouteUpdate?(
 *       to: Route,
 *       from: Route,
 *       next: () => void
 *     ): void
 *   }
 * }
 * ```
 */
export interface ComponentCustomOptions {}

export type SetupFunction<Props, RawBindings = {}, Emits extends EmitsOptions = {}> = (this: void, props: Readonly<Props>, ctx: SetupContext<Emits>) => RawBindings | (() => VNode | null) | void;

export type LooseRequired<T> = {
  [P in string & keyof T]: T[P];
};

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type ExtractOptionProp<T> = T extends ComponentOptionsBase<infer P, any, any, any, any, any, any, any, any> ? unknown extends P ? {} : P : {};

export type ComputedGetter<T> = (ctx?: any) => T;

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>;
  set: ComputedSetter<T>;
}

export type ObjectEmitsOptions = Record<string, ((...args: Array<any>) => any) | null>;

export type ComponentObjectPropsOptions<P = Data> = {
  [K in keyof P]: Prop<P[K]> | null;
};

export type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends {
    required: true;
  } | {
    default: any;
  } | BooleanConstructor | {
    type: BooleanConstructor;
  } ? K : never;
}[keyof T];

export type InferPropType<T> = [T] extends [null] ? any : [T] extends [{
  type: null | true;
}] ? any : [T] extends [ObjectConstructor | {
  type: ObjectConstructor;
}] ? Record<string, any> : [T] extends [BooleanConstructor | {
  type: BooleanConstructor;
}] ? boolean : [T] extends [DateConstructor | {
  type: DateConstructor;
}] ? Date : [T] extends [Array<(infer U)> | {
  type: Array<(infer U)>;
}] ? U extends DateConstructor ? Date | InferPropType<U> : InferPropType<U> : [T] extends [Prop<infer V, infer D>] ? unknown extends V ? IfAny<V, V, D> : V : T;

export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

export type DefaultKeys<T> = {
  [K in keyof T]: T[K] extends {
    default: any;
  } | BooleanConstructor | {
    type: BooleanConstructor;
  } ? T[K] extends {
    type: BooleanConstructor;
    required: true;
  } ? never : K : never;
}[keyof T];

export class NgModuleFactory<T> {
  get moduleType(): Type<T>;
  create(parentInjector: Injector | null): NgModuleRef<T>;
}

/**
 * Provides additional options to the bootstrapping process.
 * @publicApi
 */
export interface BootstrapOptions {
  /**
   * Optionally specify which `NgZone` should be used.
   * 
   * - Provide your own `NgZone` instance.
   * - `zone.js` - Use default `NgZone` which requires `Zone.js`.
   * - `noop` - Use `NoopNgZone` which does nothing.
   */
  ngZone?: NgZone | "zone.js" | "noop";
  /**
   * Optionally specify coalescing event change detections or not.
   * Consider the following case.
   * 
   * <div (click)="doSomething()">
   *   <button (click)="doSomethingElse()"></button>
   * </div>
   * 
   * When button is clicked, because of the event bubbling, both
   * event handlers will be called and 2 change detections will be
   * triggered. We can coalesce such kind of events to only trigger
   * change detection only once.
   * 
   * By default, this option will be false. So the events will not be
   * coalesced and the change detection will be triggered multiple times.
   * And if this option be set to true, the change detection will be
   * triggered async by scheduling a animation frame. So in the case above,
   * the change detection will only be triggered once.
   */
  ngZoneEventCoalescing?: boolean;
  /**
   * Optionally specify if `NgZone#run()` method invocations should be coalesced
   * into a single change detection.
   * 
   * Consider the following case.
   * 
   * for (let i = 0; i < 10; i ++) {
   *   ngZone.run(() => {
   *     // do something
   *   });
   * }
   * 
   * This case triggers the change detection multiple times.
   * With ngZoneRunCoalescing options, all change detections in an event loop trigger only once.
   * In addition, the change detection executes in requestAnimation.
   */
  ngZoneRunCoalescing?: boolean;
}

export class NgModuleRef<T> {
  /**
   * The injector that contains all of the providers of the `NgModule`.
   */
  get injector(): EnvironmentInjector;
  /**
   * The resolver that can retrieve component factories in a context of this module.
   * 
   * Note: since v13, dynamic component creation via
   * [`ViewContainerRef.createComponent`](api/core/ViewContainerRef#createComponent)
   * does **not** require resolving component factory: component class can be used directly.
   * @deprecated Angular no longer requires Component factories. Please use other APIs where
   * Component class can be used directly.
   */
  get componentFactoryResolver(): ComponentFactoryResolver;
  /**
   * The `NgModule` instance.
   */
  get instance(): T;
  /**
   * Destroys the module instance and all of the data structures associated with it.
   */
  destroy(): void;
  /**
   * Registers a callback to be executed when the module is destroyed.
   */
  onDestroy(callback: () => void): void;
}

/**
 * Options for creating a compiler.
 * 
 * Note: the `useJit` and `missingTranslation` config options are not used in Ivy, passing them has
 * no effect. Those config options are deprecated since v13.
 * @publicApi
 */
export type CompilerOptions = {
  /**
   * @deprecated not used at all in Ivy, providing this config option has no effect.
   */
  useJit?: boolean;
  defaultEncapsulation?: ViewEncapsulation;
  providers?: Array<StaticProvider>;
  /**
   * @deprecated not used at all in Ivy, providing this config option has no effect.
   */
  missingTranslation?: MissingTranslationStrategy;
  preserveWhitespaces?: boolean;
};

export class Injector {
  static THROW_IF_NOT_FOUND: {};
  static NULL: Injector;
  /**
   * Retrieves an instance from the injector based on the provided token.
   * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
   * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
   */
  get<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
  /**
   * @deprecated from v4.0.0 use ProviderToken<T>
   * @suppress {duplicate}
   */
  get(token: any, notFoundValue?: any): any;
  /**
   * @deprecated from v5 use the new signature Injector.create(options)
   */
  static create(providers: Array<StaticProvider>, parent?: Injector): Injector;
  /**
   * Creates a new injector instance that provides one or more dependencies,
   * according to a given type or types of `StaticProvider`.
   * @param options An object with the following properties:
   * * `providers`: An array of providers of the [StaticProvider type](api/core/StaticProvider).
   * * `parent`: (optional) A parent injector.
   * * `name`: (optional) A developer-defined identifying name for the new injector.
   * @returns The new injector instance.
   */
  static create(options: {
    providers: Array<StaticProvider>;
    parent?: Injector;
    name?: string;
  }): Injector;
  /**
   * @nocollapse
   */
  static "ɵprov": unknown;
}

/**
 * @publicApi
 */
export type ɵɵFactoryDeclaration<T, CtorDependencies extends Array<CtorDependency>> = unknown;

/**
 * Information about how a type or `InjectionToken` interfaces with the DI system.
 * 
 * At a minimum, this includes a `factory` which defines how to create the given type `T`, possibly
 * requesting injection of other types if necessary.
 * 
 * Optionally, a `providedIn` parameter specifies that the given type belongs to a particular
 * `Injector`, `NgModule`, or a special scope (e.g. `'root'`). A value of `null` indicates
 * that the injectable does not belong to any scope.
 * @codeGenApi
 * @publicApi The ViewEngine compiler emits code with this type for injectables. This code is
 * deployed to npm, and should be treated as public api.
 */
export interface ɵɵInjectableDeclaration<T> {
  /**
   * Specifies that the given type belongs to a particular injector:
   * - `InjectorType` such as `NgModule`,
   * - `'root'` the root injector
   * - `'any'` all injectors.
   * - `null`, does not belong to any injector. Must be explicitly listed in the injector
   *   `providers`.
   */
  providedIn: InjectorType<any> | "root" | "platform" | "any" | "environment" | null;
  /**
   * The token to which this definition belongs.
   * 
   * Note that this may not be the same as the type that the `factory` will create.
   */
  token: unknown;
  /**
   * Factory method to execute to create an instance of the injectable.
   */
  factory(t?: Type<any>): T;
  /**
   * In a case of no explicit injector, a location where the instance of the injectable is stored.
   */
  value: T | undefined;
}

export interface NavigationApi {
  /**
   * Pushes a new location onto the history stack.
   */
  push(target: string, state?: any): void;
  /**
   * Replaces the current location with another.
   */
  replace(target: string, state?: any): void;
  /**
   * Changes the current index in the history stack by a given delta.
   */
  go(n: number): void;
  /**
   * Prevents changes to the history stack from happening.
   * This is useful when you want to prevent the user navigating
   * away from the current page, for example when they have some
   * unsaved data on the current page.
   * @param blocker The function being called with a transition request.
   * @returns The disposable for stopping the block.
   */
  block(blocker: NavigationBlocker): Disposable;
  /**
   * Starts listening for location changes and calls the given
   * callback with an Update when it does.
   * @param listener The function being called when the route changes.
   * @returns The disposable for stopping the block.
   */
  listen(listener: NavigationListener): Disposable;
  /**
   * Gets the current navigation / application path.
   */
  path: string;
  /**
   * Gets the current navigation path incl. search and hash parts.
   */
  url: string;
  /**
   * The original router behind the navigation. Don't depend on this
   * as the implementation is router specific and may change over time.
   */
  router: any;
}

export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export type UnwrapRefSimple<T> = T extends Function | CollectionTypes | BaseTypes | Ref | RefUnwrapBailTypes[keyof RefUnwrapBailTypes] | {
  [RawSymbol]?: true;
} ? T : T extends Array<any> ? {
  [K in keyof T]: UnwrapRefSimple<T[K]>;
} : T extends object & {
  [ShallowReactiveMarker]?: never;
} ? {
  [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]>;
} : T;

export interface Ref<T = any> {
  value: T;
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true;
}

export type OptionTypesType<P = {}, B = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions = {}, Defaults = {}> = {
  P: P;
  B: B;
  D: D;
  C: C;
  M: M;
  Defaults: Defaults;
};

export type OptionTypesKeys = "P" | "B" | "D" | "C" | "M" | "Defaults";

export type ExtractMixin<T> = {
  Mixin: MixinToOptionTypes<T>;
}[T extends ComponentOptionsMixin ? "Mixin" : never];

export type IsDefaultMixinComponent<T> = T extends ComponentOptionsMixin ? ComponentOptionsMixin extends T ? true : false : false;

export interface PropOptions<T = any> {
  type?: PropType<T>;
  required?: boolean;
  default?: T | null | undefined | (() => T | null | undefined);
  validator?(value: unknown): boolean;
}

export type PropType<T> = Prop___1<T> | Array<Prop___1<T>>;

export interface VNodeDirective {
  name: string;
  value?: any;
  oldValue?: any;
  expression?: string;
  arg?: string;
  oldArg?: string;
  modifiers?: {
    [key: string]: boolean;
  };
  def?: DirectiveFunction | DirectiveOptions;
}

export interface DirectiveBinding___1<V> extends Readonly<VNodeDirective> {
  readonly modifiers: DirectiveModifiers;
  readonly value: V;
  readonly oldValue: V | null;
}

export type ImportedComponent<Data = DefaultData<never>, Methods = DefaultMethods<never>, Computed = DefaultComputed, Props = DefaultProps, SetupBindings = {}> = EsModule<Component<Data, Methods, Computed, Props, SetupBindings>>;

export type ScopedSlot = (props: any) => ScopedSlotReturnValue;

export type VNodeRef = string | Ref | ((ref: Element | ComponentPublicInstance | null, refs: Record<string, any>) => void);

export type StyleValue = string | CSSProperties | Array<StyleValue>;

export interface VNodeChildrenArrayContents extends Array<VNodeChildren | VNode> {}

export type ScopedSlotChildren = Array<VNode> | undefined;

export type Slot = (...args: Array<any>) => Array<VNode>;

export const enum TrackOpTypes {
  GET = "get",
  TOUCH = "touch",
}

export const enum TriggerOpTypes {
  SET = "set",
  ADD = "add",
  DELETE = "delete",
  ARRAY_MUTATION = "array mutation",
}

export interface Vue3Instance<D, P, PublicProps, E, Defaults, MakeDefaultsOptional, Options> extends Vue<D, Readonly<MakeDefaultsOptional extends true ? Partial<Defaults> & Omit<P & PublicProps, keyof Defaults> : P & PublicProps>, ComponentPublicInstance, Options & MergedComponentOptionsOverride, EmitFn<E>> {}

/**
 * Custom properties added to component instances in any way and can be accessed through `this`
 * @example
 * ```ts
 * import { Router } from 'vue-router'
 * 
 * declare module 'vue' {
 *   interface ComponentCustomProperties {
 *     $router: Router
 *   }
 * }
 * ```
 */
export interface ComponentCustomProperties {}

export type ComputedSetter<T> = (v: T) => void;

export type Prop<T, D = T> = PropOptions___1<T, D> | PropType___1<T>;

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

export class NgZone {
  readonly hasPendingMacrotasks: boolean;
  readonly hasPendingMicrotasks: boolean;
  /**
   * Whether there are no outstanding microtasks or macrotasks.
   */
  readonly isStable: boolean;
  /**
   * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
   */
  readonly onUnstable: EventEmitter___1<any>;
  /**
   * Notifies when there is no more microtasks enqueued in the current VM Turn.
   * This is a hint for Angular to do change detection, which may enqueue more microtasks.
   * For this reason this event can fire multiple times per VM Turn.
   */
  readonly onMicrotaskEmpty: EventEmitter___1<any>;
  /**
   * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
   * implies we are about to relinquish VM turn.
   * This event gets called just once.
   */
  readonly onStable: EventEmitter___1<any>;
  /**
   * Notifies that an error has been delivered.
   */
  readonly onError: EventEmitter___1<any>;
  constructor({ enableLongStackTrace, shouldCoalesceEventChangeDetection, shouldCoalesceRunChangeDetection }: {
    enableLongStackTrace?: boolean | undefined;
    shouldCoalesceEventChangeDetection?: boolean | undefined;
    shouldCoalesceRunChangeDetection?: boolean | undefined;
  });
  static isInAngularZone(): boolean;
  static assertInAngularZone(): void;
  static assertNotInAngularZone(): void;
  /**
   * Executes the `fn` function synchronously within the Angular zone and returns value returned by
   * the function.
   * 
   * Running functions via `run` allows you to reenter Angular zone from a task that was executed
   * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
   * 
   * Any future tasks or microtasks scheduled from within this function will continue executing from
   * within the Angular zone.
   * 
   * If a synchronous error happens it will be rethrown and not reported via `onError`.
   */
  run<T>(fn: (...args: Array<any>) => T, applyThis?: any, applyArgs?: Array<any>): T;
  /**
   * Executes the `fn` function synchronously within the Angular zone as a task and returns value
   * returned by the function.
   * 
   * Running functions via `run` allows you to reenter Angular zone from a task that was executed
   * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
   * 
   * Any future tasks or microtasks scheduled from within this function will continue executing from
   * within the Angular zone.
   * 
   * If a synchronous error happens it will be rethrown and not reported via `onError`.
   */
  runTask<T>(fn: (...args: Array<any>) => T, applyThis?: any, applyArgs?: Array<any>, name?: string): T;
  /**
   * Same as `run`, except that synchronous errors are caught and forwarded via `onError` and not
   * rethrown.
   */
  runGuarded<T>(fn: (...args: Array<any>) => T, applyThis?: any, applyArgs?: Array<any>): T;
  /**
   * Executes the `fn` function synchronously in Angular's parent zone and returns value returned by
   * the function.
   * 
   * Running functions via {@link #runOutsideAngular} allows you to escape Angular's zone and do
   * work that
   * doesn't trigger Angular change-detection or is subject to Angular's error handling.
   * 
   * Any future tasks or microtasks scheduled from within this function will continue executing from
   * outside of the Angular zone.
   * 
   * Use {@link #run} to reenter the Angular zone and do work that updates the application model.
   */
  runOutsideAngular<T>(fn: (...args: Array<any>) => T): T;
}

export class EnvironmentInjector implements Injector {
  /**
   * Retrieves an instance from the injector based on the provided token.
   * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
   * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
   */
  get<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
  /**
   * Retrieves an instance from the injector based on the provided token.
   * @deprecated from v4.0.0 use ProviderToken<T>
   * @suppress {duplicate}
   */
  get(token: any, notFoundValue?: any): any;
  /**
   * Runs the given function in the context of this `EnvironmentInjector`.
   * 
   * Within the function's stack frame, `inject` can be used to inject dependencies from this
   * injector. Note that `inject` is only usable synchronously, and cannot be used in any
   * asynchronous callbacks or after any `await` points.
   * @param fn the closure to be run in the context of this injector
   * @returns the return value of the function, if any
   */
  runInContext<ReturnT>(fn: () => ReturnT): ReturnT;
  destroy(): void;
}

export class ComponentFactoryResolver {
  static NULL: ComponentFactoryResolver;
  /**
   * Retrieves the factory object that creates a component of the given type.
   * @param component The component type.
   */
  resolveComponentFactory<T>(component: Type<T>): ComponentFactory<T>;
}

/**
 * Defines the CSS styles encapsulation policies for the {@link Component} decorator's
 * `encapsulation` option.
 * 
 * See {@link Component#encapsulation encapsulation}.
 * @usageNotes ### Example
 * 
 * {@example core/ts/metadata/encapsulation.ts region='longform'}
 * @publicApi
 */
export enum ViewEncapsulation {
  /**
   * Emulates a native Shadow DOM encapsulation behavior by adding a specific attribute to the
   * component's host element and applying the same attribute to all the CSS selectors provided
   * via {@link Component#styles styles} or {@link Component#styleUrls styleUrls}.
   * 
   * This is the default option.
   */
  Emulated = 0,
  /**
   * Doesn't provide any sort of CSS style encapsulation, meaning that all the styles provided
   * via {@link Component#styles styles} or {@link Component#styleUrls styleUrls} are applicable
   * to any HTML element of the application regardless of their host Component.
   */
  None = 2,
  /**
   * Uses the browser's native Shadow DOM API to encapsulate CSS styles, meaning that it creates
   * a ShadowRoot for the component's host element which is then used to encapsulate
   * all the Component's styling.
   */
  ShadowDom = 3,
}

/**
 * Describes how an `Injector` should be configured as static (that is, without reflection).
 * A static provider provides tokens to an injector for various types of dependencies.
 * @see  `Injector.create()`.
 * @see ["Dependency Injection Guide"](guide/dependency-injection-providers).
 * @publicApi
 */
export type StaticProvider = ValueProvider | ExistingProvider | StaticClassProvider | ConstructorProvider | FactoryProvider | Array<any>;

/**
 * Use this enum at bootstrap as an option of `bootstrapModule` to define the strategy
 * that the compiler should use in case of missing translations:
 * - Error: throw if you have missing translations.
 * - Warning (default): show a warning in the console and/or shell.
 * - Ignore: do nothing.
 * 
 * See the [i18n guide](guide/i18n-common-merge#report-missing-translations) for more information.
 * @usageNotes ### Example
 * ```typescript
 * import { MissingTranslationStrategy } from '@angular/core';
 * import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 * 
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   missingTranslation: MissingTranslationStrategy.Error
 * });
 * ```
 * @publicApi
 */
export enum MissingTranslationStrategy {
  Error = 0,
  Warning = 1,
  Ignore = 2,
}

/**
 * @description Token that can be used to retrieve an instance from an injector or through a query.
 * @publicApi
 */
export type ProviderToken<T> = Type<T> | AbstractType<T> | InjectionToken<T>;

/**
 * Injection flags for DI.
 * @publicApi
 * @deprecated use an options object for `inject` instead.
 */
export enum InjectFlags {
  /**
   * Check self and check parent injector if needed
   */
  Default = 0,
  /**
   * Specifies that an injector should retrieve a dependency from any injector until reaching the
   * host element of the current component. (Only used with Element Injector)
   */
  Host = 1,
  /**
   * Don't ascend to ancestors of the node requesting injection.
   */
  Self = 2,
  /**
   * Skip the node that is requesting injection.
   */
  SkipSelf = 4,
  /**
   * Inject `defaultValue` instead if token not found.
   */
  Optional = 8,
}

/**
 * An object literal of this type is used to represent the metadata of a constructor dependency.
 * The type itself is never referred to from generated code.
 * @publicApi
 */
export type CtorDependency = {
  /**
   * If an `@Attribute` decorator is used, this represents the injected attribute's name. If the
   * attribute name is a dynamic expression instead of a string literal, this will be the unknown
   * type.
   */
  attribute?: string | unknown;
  /**
   * If `@Optional()` is used, this key is set to true.
   */
  optional?: true;
  /**
   * If `@Host` is used, this key is set to true.
   */
  host?: true;
  /**
   * If `@Self` is used, this key is set to true.
   */
  self?: true;
  /**
   * If `@SkipSelf` is used, this key is set to true.
   */
  skipSelf?: true;
} | null;

/**
 * A type which has an `InjectorDef` static field.
 * 
 * `InjectorTypes` can be used to configure a `StaticInjector`.
 * 
 * This is an opaque type whose structure is highly version dependent. Do not rely on any
 * properties.
 * @publicApi
 */
export interface InjectorType<T> extends Type<T> {
  "ɵfac"?: unknown;
  "ɵinj": unknown;
}

export interface NavigationBlocker {
  (tx: NavigationTransition): void;
}

export interface NavigationListener {
  (update: NavigationUpdate): void;
}

export const ShallowReactiveMarker: unique symbol;

export type UnwrapRef<T> = T extends ShallowRef<infer V> ? V : T extends Ref<infer V> ? UnwrapRefSimple<V> : UnwrapRefSimple<T>;

export type CollectionTypes = IterableCollections | WeakCollections;

export type BaseTypes = string | number | boolean;

/**
 * This is a special exported interface for other packages to declare
 * additional types that should bail out for ref unwrapping. For example
 * \@vue/runtime-dom can declare it like so in its d.ts:
 * 
 * ``` ts
 * declare module 'vue' {
 *   export interface RefUnwrapBailTypes {
 *     runtimeDOMBailTypes: Node | Window
 *   }
 * }
 * ```
 * 
 * Note that api-extractor somehow refuses to include `declare module`
 * augmentations in its generated d.ts, so we have to manually append them
 * to the final generated d.ts in our build process.
 */
export interface RefUnwrapBailTypes {
  runtimeDOMBailTypes: Node | Window;
}

export const RawSymbol: unique symbol;

export const RefSymbol: unique symbol;

export type MixinToOptionTypes<T> = T extends ComponentOptionsBase<infer P, infer B, infer D, infer C, infer M, infer Mixin, infer Extends, any, any, infer Defaults> ? OptionTypesType<P & {}, B & {}, D & {}, C & {}, M & {}, Defaults & {}> & IntersectionMixin<Mixin> & IntersectionMixin<Extends> : never;

export type Prop___1<T> = {
  (): T;
} | {
  new (...args: Array<never>): T & object;
} | {
  new (...args: Array<string>): Function;
};

export type DirectiveModifiers = Record<string, boolean>;

export type EsModule<T> = T | {
  default: T;
};

export type ScopedSlotReturnValue = VNode | string | boolean | null | undefined | ScopedSlotReturnArray;

export interface CSSProperties extends Properties<string | number>, PropertiesHyphen<string | number> {
  [v: `--${string}`]: string | number | undefined;
}

export type MergedComponentOptionsOverride = {
  beforeCreate?: MergedHook;
  created?: MergedHook;
  beforeMount?: MergedHook;
  mounted?: MergedHook;
  beforeUpdate?: MergedHook;
  updated?: MergedHook;
  activated?: MergedHook;
  deactivated?: MergedHook;
  /**
   * @deprecated use `beforeUnmount` instead
   */
  beforeDestroy?: MergedHook;
  beforeUnmount?: MergedHook;
  /**
   * @deprecated use `unmounted` instead
   */
  destroyed?: MergedHook;
  unmounted?: MergedHook;
  renderTracked?: MergedHook<DebuggerHook>;
  renderTriggered?: MergedHook<DebuggerHook>;
  errorCaptured?: MergedHook<ErrorCapturedHook>;
};

export interface PropOptions___1<T = any, D = T> {
  type?: PropType___1<T> | true | null;
  required?: boolean;
  default?: D | DefaultFactory<D> | null | undefined | object;
  validator?(value: unknown): boolean;
}

export type PropType___1<T> = PropConstructor<T> | Array<PropConstructor<T>>;

/**
 * Use in components with the `@Output` directive to emit custom events
 * synchronously or asynchronously, and register handlers for those events
 * by subscribing to an instance.
 * @usageNotes Extends
 * [RxJS `Subject`](https://rxjs.dev/api/index/class/Subject)
 * for Angular by adding the `emit()` method.
 * 
 * In the following example, a component defines two output properties
 * that create event emitters. When the title is clicked, the emitter
 * emits an open or close event to toggle the current visibility state.
 * 
 * ```html
 * @Component ({
 * selector: 'zippy',
 * template: `
 * <div class="zippy">
 * <div (click)="toggle()">Toggle</div>
 * <div [hidden]="!visible">
 * <ng-content></ng-content>
 * </div>
 * </div>`})
 * export class Zippy {
 * visible: boolean = true;
 * @Output () open: EventEmitter<any> = new EventEmitter();
 * @Output () close: EventEmitter<any> = new EventEmitter();
 * 
 * toggle() {
 * this.visible = !this.visible;
 * if (this.visible) {
 * this.open.emit(null);
 * } else {
 * this.close.emit(null);
 * }
 * }
 * }
 * ```
 * 
 * Access the event object with the `$event` argument passed to the output event
 * handler:
 * 
 * ```html
 * <zippy (open)="onOpen($event)" (close)="onClose($event)"></zippy>
 * ```
 * @see [Observables in Angular](guide/observables-in-angular)
 * @publicApi
 * @publicApi
 */
export const EventEmitter___1: {
  new (isAsync?: boolean): EventEmitter___1<any>;
  new <T>(isAsync?: boolean): EventEmitter___1<T>;
  readonly prototype: EventEmitter___1<any>;
};

export class ComponentFactory<C> {
  /**
   * The component's HTML selector.
   */
  get selector(): string;
  /**
   * The type of component the factory will create.
   */
  get componentType(): Type<any>;
  /**
   * Selector for all <ng-content> elements in the component.
   */
  get ngContentSelectors(): Array<string>;
  /**
   * The inputs of the component.
   */
  get inputs(): Array<{
    propName: string;
    templateName: string;
  }>;
  /**
   * The outputs of the component.
   */
  get outputs(): Array<{
    propName: string;
    templateName: string;
  }>;
  /**
   * Creates a new component.
   */
  create(injector: Injector, projectableNodes?: Array<Array<any>>, rootSelectorOrNode?: string | any, environmentInjector?: EnvironmentInjector | NgModuleRef<any>): ComponentRef<C>;
}

/**
 * Configures the `Injector` to return a value for a token.
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 * @usageNotes ### Example
 * 
 * {@example core/di/ts/provider_spec.ts region='ValueProvider'}
 * 
 * ### Multi-value example
 * 
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 * @publicApi
 */
export interface ValueProvider extends ValueSansProvider {
  /**
   * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
   */
  provide: any;
  /**
   * When true, injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return a value of another `useExisting` token.
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 * @usageNotes {@example core/di/ts/provider_spec.ts region='ExistingProvider'}
 * 
 * ### Multi-value example
 * 
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 * @publicApi
 */
export interface ExistingProvider extends ExistingSansProvider {
  /**
   * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
   */
  provide: any;
  /**
   * When true, injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 * @usageNotes {@example core/di/ts/provider_spec.ts region='StaticClassProvider'}
 * 
 * Note that following two providers are not equal:
 * 
 * {@example core/di/ts/provider_spec.ts region='StaticClassProviderDifference'}
 * 
 * ### Multi-value example
 * 
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 * @publicApi
 */
export interface StaticClassProvider extends StaticClassSansProvider {
  /**
   * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
   */
  provide: any;
  /**
   * When true, injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return an instance of a token.
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 * @usageNotes {@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
 * 
 * ### Multi-value example
 * 
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 * @publicApi
 */
export interface ConstructorProvider extends ConstructorSansProvider {
  /**
   * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
   */
  provide: Type<any>;
  /**
   * When true, injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 * @usageNotes {@example core/di/ts/provider_spec.ts region='FactoryProvider'}
 * 
 * Dependencies can also be marked as optional:
 * 
 * {@example core/di/ts/provider_spec.ts region='FactoryProviderOptionalDeps'}
 * 
 * ### Multi-value example
 * 
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 * @publicApi
 */
export interface FactoryProvider extends FactorySansProvider {
  /**
   * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
   */
  provide: any;
  /**
   * When true, injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to provide configuration information to a common token.
   */
  multi?: boolean;
}

/**
 * @description Represents an abstract class `T`, if applied to a concrete class it would stop being
 * instantiable.
 * @publicApi
 */
export interface AbstractType<T> extends Function {
  prototype: T;
}

export class InjectionToken<T> {
  protected _desc: string;
  readonly "ɵprov": unknown;
  constructor(_desc: string, options?: {
    providedIn?: Type<any> | "root" | "platform" | "any" | null;
    factory(): T;
  });
  toString(): string;
}

export interface NavigationTransition extends NavigationUpdate {
  retry?(): void;
}

export interface NavigationUpdate {
  action: NavigationAction;
  location: NavigationLocation;
}

export type ShallowRef<T = any> = Ref<T> & {
  [ShallowRefMarker]?: true;
};

export type IterableCollections = Map<any, any> | Set<any>;

export type WeakCollections = WeakMap<any, any> | WeakSet<any>;

export interface ScopedSlotReturnArray extends Array<ScopedSlotReturnValue> {}

export interface Properties<TLength = (string & {}) | 0, TTime = string & {}> extends StandardProperties<TLength, TTime>, VendorProperties<TLength, TTime>, ObsoleteProperties<TLength, TTime>, SvgProperties<TLength, TTime> {}

export interface PropertiesHyphen<TLength = (string & {}) | 0, TTime = string & {}> extends StandardPropertiesHyphen<TLength, TTime>, VendorPropertiesHyphen<TLength, TTime>, ObsoletePropertiesHyphen<TLength, TTime>, SvgPropertiesHyphen<TLength, TTime> {}

export type MergedHook<T = () => void> = T | Array<T>;

export type DebuggerHook = (e: DebuggerEvent) => void;

export type ErrorCapturedHook<TError = unknown> = (err: TError, instance: ComponentPublicInstance | null, info: string) => boolean | void;

export type DefaultFactory<T> = () => T | null | undefined;

export type PropConstructor<T> = {
  (): T;
} | {
  new (...args: Array<never>): T & object;
} | {
  new (...args: Array<string>): Function;
};

export class ComponentRef<C> {
  /**
   * Updates a specified input name to a new value. Using this method will properly mark for check
   * component using the `OnPush` change detection strategy. It will also assure that the
   * `OnChanges` lifecycle hook runs when a dynamically created component is change-detected.
   * @param name The name of an input.
   * @param value The new value of an input.
   */
  setInput(name: string, value: unknown): void;
  /**
   * The host or anchor [element](guide/glossary#element) for this component instance.
   */
  get location(): ElementRef;
  /**
   * The [dependency injector](guide/glossary#injector) for this component instance.
   */
  get injector(): Injector;
  /**
   * This component instance.
   */
  get instance(): C;
  /**
   * The [host view](guide/glossary#view-tree) defined by the template
   * for this component instance.
   */
  get hostView(): ViewRef;
  /**
   * The change detector for this component instance.
   */
  get changeDetectorRef(): ChangeDetectorRef;
  /**
   * The type of this component (as created by a `ComponentFactory` class).
   */
  get componentType(): Type<any>;
  /**
   * Destroys the component instance and all of the data structures associated with it.
   */
  destroy(): void;
  /**
   * A lifecycle hook that provides additional developer-defined cleanup
   * functionality for the component.
   * @param callback A handler function that cleans up developer-defined data
   * associated with this component. Called when the `destroy()` method is invoked.
   */
  onDestroy(callback: Function): void;
}

/**
 * Configures the `Injector` to return a value for a token.
 * Base for `ValueProvider` decorator.
 * @publicApi
 */
export interface ValueSansProvider {
  /**
   * The value to inject.
   */
  useValue: any;
}

/**
 * Configures the `Injector` to return a value of another `useExisting` token.
 * @see  `ExistingProvider`
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 * @publicApi
 */
export interface ExistingSansProvider {
  /**
   * Existing `token` to return. (Equivalent to `injector.get(useExisting)`)
   */
  useExisting: any;
}

/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 * Base for `StaticClassProvider` decorator.
 * @publicApi
 */
export interface StaticClassSansProvider {
  /**
   * An optional class to instantiate for the `token`. By default, the `provide`
   * class is instantiated.
   */
  useClass: Type<any>;
  /**
   * A list of `token`s to be resolved by the injector. The list of values is then
   * used as arguments to the `useClass` constructor.
   */
  deps: Array<any>;
}

/**
 * Configures the `Injector` to return an instance of a token.
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 * @usageNotes ```ts
 * @Injectable (SomeModule, {deps: []})
 * class MyService {}
 * ```
 * @publicApi
 */
export interface ConstructorSansProvider {
  /**
   * A list of `token`s to be resolved by the injector.
   */
  deps?: Array<any>;
}

/**
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 * @see  `FactoryProvider`
 * @see ["Dependency Injection Guide"](guide/dependency-injection).
 * @publicApi
 */
export interface FactorySansProvider {
  /**
   * A function to invoke to create a value for this `token`. The function is invoked with
   * resolved values of `token`s in the `deps` field.
   */
  useFactory: Function;
  /**
   * A list of `token`s to be resolved by the injector. The list of values is then
   * used as arguments to the `useFactory` function.
   */
  deps?: Array<any>;
}

export type NavigationAction = "POP" | "PUSH" | "REPLACE";

export interface NavigationLocation {
  /**
   * The fully qualified URL incl. the origin and base path.
   */
  href: string;
  /**
   * The location.pathname property is a string that contains an initial "/"
   * followed by the remainder of the URL up to the ?.
   */
  pathname: string;
  /**
   * The location.search property is a string that contains an initial "?"
   * followed by the key=value pairs in the query string. If there are no
   * parameters, this value may be the empty string (i.e. '').
   */
  search: string;
  /**
   * The location.hash property is a string that contains an initial "#"
   * followed by fragment identifier of the URL. If there is no fragment
   * identifier, this value may be the empty string (i.e. '').
   */
  hash: string;
  /**
   * The location.state property is a user-supplied State object that is
   * associated with this location. This can be a useful place to store
   * any information you do not want to put in the URL, e.g. session-specific
   * data.
   */
  state: unknown;
  /**
   * The location.key property is a unique string associated with this location.
   * On the initial location, this will be the string default. On all subsequent
   * locations, this string will be a unique identifier.
   */
  key?: string;
}

export const ShallowRefMarker: unique symbol;

export interface StandardProperties<TLength = (string & {}) | 0, TTime = string & {}> extends StandardLonghandProperties<TLength, TTime>, StandardShorthandProperties<TLength, TTime> {}

export interface VendorProperties<TLength = (string & {}) | 0, TTime = string & {}> extends VendorLonghandProperties<TLength, TTime>, VendorShorthandProperties<TLength, TTime> {}

export interface ObsoleteProperties<TLength = (string & {}) | 0, TTime = string & {}> {
  /**
   * In combination with `elevation`, the **`azimuth`** CSS property enables different audio sources to be positioned spatially for aural presentation. This is important in that it provides a natural way to tell several voices apart, as each can be positioned to originate at a different location on the sound stage. Stereo output produce a lateral sound stage, while binaural headphones and multi-speaker setups allow for a fully three-dimensional stage.
   * 
   * **Syntax**: `<angle> | [ [ left-side | far-left | left | center-left | center | center-right | right | far-right | right-side ] || behind ] | leftwards | rightwards`
   * 
   * **Initial value**: `center`
   * @deprecated
   */
  azimuth?: Azimuth | undefined;
  /**
   * The **`box-align`** CSS property specifies how an element aligns its contents across its layout in a perpendicular direction. The effect of the property is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | baseline | stretch`
   * 
   * **Initial value**: `stretch`
   * @deprecated
   */
  boxAlign?: BoxAlign | undefined;
  /**
   * The **`box-direction`** CSS property specifies whether a box lays out its contents normally (from the top or left edge), or in reverse (from the bottom or right edge).
   * 
   * **Syntax**: `normal | reverse | inherit`
   * 
   * **Initial value**: `normal`
   * @deprecated
   */
  boxDirection?: BoxDirection | undefined;
  /**
   * The **`-moz-box-flex`** and **`-webkit-box-flex`** CSS properties specify how a `-moz-box` or `-webkit-box` grows to fill the box that contains it, in the direction of the containing box's layout.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  boxFlex?: BoxFlex | undefined;
  /**
   * The **`box-flex-group`** CSS property assigns the flexbox's child elements to a flex group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  boxFlexGroup?: BoxFlexGroup | undefined;
  /**
   * The **`box-lines`** CSS property determines whether the box may have a single or multiple lines (rows for horizontally oriented boxes, columns for vertically oriented boxes).
   * 
   * **Syntax**: `single | multiple`
   * 
   * **Initial value**: `single`
   * @deprecated
   */
  boxLines?: BoxLines | undefined;
  /**
   * The **`box-ordinal-group`** CSS property assigns the flexbox's child elements to an ordinal group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  boxOrdinalGroup?: BoxOrdinalGroup | undefined;
  /**
   * The **`box-orient`** CSS property sets whether an element lays out its contents horizontally or vertically.
   * 
   * **Syntax**: `horizontal | vertical | inline-axis | block-axis | inherit`
   * 
   * **Initial value**: `inline-axis` (`horizontal` in XUL)
   * @deprecated
   */
  boxOrient?: BoxOrient | undefined;
  /**
   * The **`-moz-box-pack`** and **`-webkit-box-pack`** CSS properties specify how a `-moz-box` or `-webkit-box` packs its contents in the direction of its layout. The effect of this is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | justify`
   * 
   * **Initial value**: `start`
   * @deprecated
   */
  boxPack?: BoxPack | undefined;
  /**
   * The **`clip`** CSS property defines a visible portion of an element. The `clip` property applies only to absolutely positioned elements — that is, elements with `position:absolute` or `position:fixed`.
   * 
   * **Syntax**: `<shape> | auto`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  clip?: Clip | undefined;
  /**
   * The **`column-gap`** CSS property sets the size of the gap (gutter) between an element's columns.
   * 
   * **Syntax**: `<length-percentage>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  gridColumnGap?: GridColumnGap<TLength> | undefined;
  /**
   * The **`gap`** CSS property sets the gaps (gutters) between rows and columns. It is a shorthand for `row-gap` and `column-gap`.
   * 
   * **Syntax**: `<'grid-row-gap'> <'grid-column-gap'>?`
   * @deprecated
   */
  gridGap?: GridGap<TLength> | undefined;
  /**
   * The **`row-gap`** CSS property sets the size of the gap (gutter) between an element's grid rows.
   * 
   * **Syntax**: `<length-percentage>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  gridRowGap?: GridRowGap<TLength> | undefined;
  /**
   * The **`ime-mode`** CSS property controls the state of the input method editor (IME) for text fields. This property is obsolete.
   * 
   * **Syntax**: `auto | normal | active | inactive | disabled`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  imeMode?: ImeMode | undefined;
  /**
   * The **`inset-block`** CSS property defines the logical block start and end offsets of an element, which maps to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top` and `bottom`, or `right` and `left` properties depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>{1,2}`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  offsetBlock?: InsetBlock<TLength> | undefined;
  /**
   * The **`inset-block-end`** CSS property defines the logical block end offset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  offsetBlockEnd?: InsetBlockEnd<TLength> | undefined;
  /**
   * The **`inset-block-start`** CSS property defines the logical block start offset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  offsetBlockStart?: InsetBlockStart<TLength> | undefined;
  /**
   * The **`inset-inline`** CSS property defines the logical start and end offsets of an element in the inline direction, which maps to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top` and `bottom`, or `right` and `left` properties depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>{1,2}`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  offsetInline?: InsetInline<TLength> | undefined;
  /**
   * The **`inset-inline-end`** CSS property defines the logical inline end inset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  offsetInlineEnd?: InsetInlineEnd<TLength> | undefined;
  /**
   * The **`inset-inline-start`** CSS property defines the logical inline start inset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  offsetInlineStart?: InsetInlineStart<TLength> | undefined;
  /**
   * The **`scroll-snap-coordinate`** CSS property defines the x and y coordinate positions within an element that will align with its nearest ancestor scroll container's `scroll-snap-destination` for each respective axis.
   * 
   * **Syntax**: `none | <position>#`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  scrollSnapCoordinate?: ScrollSnapCoordinate<TLength> | undefined;
  /**
   * The **`scroll-snap-destination`** CSS property defines the position in x and y coordinates within the scroll container's visual viewport which element snap points align with.
   * 
   * **Syntax**: `<position>`
   * 
   * **Initial value**: `0px 0px`
   * @deprecated
   */
  scrollSnapDestination?: ScrollSnapDestination<TLength> | undefined;
  /**
   * The **`scroll-snap-points-x`** CSS property defines the horizontal positioning of snap points within the content of the scroll container they are applied to.
   * 
   * **Syntax**: `none | repeat( <length-percentage> )`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  scrollSnapPointsX?: ScrollSnapPointsX | undefined;
  /**
   * The **`scroll-snap-points-y`** CSS property defines the vertical positioning of snap points within the content of the scroll container they are applied to.
   * 
   * **Syntax**: `none | repeat( <length-percentage> )`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  scrollSnapPointsY?: ScrollSnapPointsY | undefined;
  /**
   * The **`scroll-snap-type-x`** CSS property defines how strictly snap points are enforced on the horizontal axis of the scroll container in case there is one.
   * 
   * **Syntax**: `none | mandatory | proximity`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  scrollSnapTypeX?: ScrollSnapTypeX | undefined;
  /**
   * The **`scroll-snap-type-y`** CSS property defines how strictly snap points are enforced on the vertical axis of the scroll container in case there is one.
   * 
   * **Syntax**: `none | mandatory | proximity`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  scrollSnapTypeY?: ScrollSnapTypeY | undefined;
  /**
   * The **`box-align`** CSS property specifies how an element aligns its contents across its layout in a perpendicular direction. The effect of the property is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | baseline | stretch`
   * 
   * **Initial value**: `stretch`
   * @deprecated
   */
  KhtmlBoxAlign?: BoxAlign | undefined;
  /**
   * The **`box-direction`** CSS property specifies whether a box lays out its contents normally (from the top or left edge), or in reverse (from the bottom or right edge).
   * 
   * **Syntax**: `normal | reverse | inherit`
   * 
   * **Initial value**: `normal`
   * @deprecated
   */
  KhtmlBoxDirection?: BoxDirection | undefined;
  /**
   * The **`-moz-box-flex`** and **`-webkit-box-flex`** CSS properties specify how a `-moz-box` or `-webkit-box` grows to fill the box that contains it, in the direction of the containing box's layout.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  KhtmlBoxFlex?: BoxFlex | undefined;
  /**
   * The **`box-flex-group`** CSS property assigns the flexbox's child elements to a flex group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  KhtmlBoxFlexGroup?: BoxFlexGroup | undefined;
  /**
   * The **`box-lines`** CSS property determines whether the box may have a single or multiple lines (rows for horizontally oriented boxes, columns for vertically oriented boxes).
   * 
   * **Syntax**: `single | multiple`
   * 
   * **Initial value**: `single`
   * @deprecated
   */
  KhtmlBoxLines?: BoxLines | undefined;
  /**
   * The **`box-ordinal-group`** CSS property assigns the flexbox's child elements to an ordinal group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  KhtmlBoxOrdinalGroup?: BoxOrdinalGroup | undefined;
  /**
   * The **`box-orient`** CSS property sets whether an element lays out its contents horizontally or vertically.
   * 
   * **Syntax**: `horizontal | vertical | inline-axis | block-axis | inherit`
   * 
   * **Initial value**: `inline-axis` (`horizontal` in XUL)
   * @deprecated
   */
  KhtmlBoxOrient?: BoxOrient | undefined;
  /**
   * The **`-moz-box-pack`** and **`-webkit-box-pack`** CSS properties specify how a `-moz-box` or `-webkit-box` packs its contents in the direction of its layout. The effect of this is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | justify`
   * 
   * **Initial value**: `start`
   * @deprecated
   */
  KhtmlBoxPack?: BoxPack | undefined;
  /**
   * The **`line-break`** CSS property sets how to break lines of Chinese, Japanese, or Korean (CJK) text when working with punctuation and symbols.
   * 
   * **Syntax**: `auto | loose | normal | strict | anywhere`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  KhtmlLineBreak?: LineBreak | undefined;
  /**
   * The **`opacity`** CSS property sets the opacity of an element. Opacity is the degree to which content behind an element is hidden, and is the opposite of transparency.
   * 
   * **Syntax**: `<alpha-value>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  KhtmlOpacity?: Opacity | undefined;
  /**
   * The **`user-select`** CSS property controls whether the user can select text. This doesn't have any effect on content loaded as part of a browser's user interface (its chrome), except in textboxes.
   * 
   * **Syntax**: `auto | text | none | contain | all`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  KhtmlUserSelect?: UserSelect | undefined;
  /**
   * The **`background-clip`** CSS property sets whether an element's background extends underneath its border box, padding box, or content box.
   * 
   * **Syntax**: `<box>#`
   * 
   * **Initial value**: `border-box`
   * @deprecated
   */
  MozBackgroundClip?: BackgroundClip | undefined;
  /**
   * The **`box-decoration-break`** CSS property specifies how an element's fragments should be rendered when broken across multiple lines, columns, or pages.
   * 
   * **Syntax**: `slice | clone`
   * 
   * **Initial value**: `slice`
   * @deprecated
   */
  MozBackgroundInlinePolicy?: BoxDecorationBreak | undefined;
  /**
   * The **`background-origin`** CSS property sets the background's origin: from the border start, inside the border, or inside the padding.
   * 
   * **Syntax**: `<box>#`
   * 
   * **Initial value**: `padding-box`
   * @deprecated
   */
  MozBackgroundOrigin?: BackgroundOrigin | undefined;
  /**
   * The **`background-size`** CSS property sets the size of the element's background image. The image can be left to its natural size, stretched, or constrained to fit the available space.
   * 
   * **Syntax**: `<bg-size>#`
   * 
   * **Initial value**: `auto auto`
   * @deprecated
   */
  MozBackgroundSize?: BackgroundSize<TLength> | undefined;
  /**
   * The **`-moz-binding`** CSS property is used by Mozilla-based applications to attach an XBL binding to a DOM element.
   * 
   * **Syntax**: `<url> | none`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  MozBinding?: MozBinding | undefined;
  /**
   * The **`border-radius`** CSS property rounds the corners of an element's outer border edge. You can set a single radius to make circular corners, or two radii to make elliptical corners.
   * 
   * **Syntax**: `<length-percentage>{1,4} [ / <length-percentage>{1,4} ]?`
   * @deprecated
   */
  MozBorderRadius?: BorderRadius<TLength> | undefined;
  /**
   * The **`border-bottom-left-radius`** CSS property rounds the bottom-left corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  MozBorderRadiusBottomleft?: BorderBottomLeftRadius<TLength> | undefined;
  /**
   * The **`border-bottom-right-radius`** CSS property rounds the bottom-right corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  MozBorderRadiusBottomright?: BorderBottomRightRadius<TLength> | undefined;
  /**
   * The **`border-top-left-radius`** CSS property rounds the top-left corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  MozBorderRadiusTopleft?: BorderTopLeftRadius<TLength> | undefined;
  /**
   * The **`border-top-right-radius`** CSS property rounds the top-right corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  MozBorderRadiusTopright?: BorderTopRightRadius<TLength> | undefined;
  /**
   * The **`box-align`** CSS property specifies how an element aligns its contents across its layout in a perpendicular direction. The effect of the property is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | baseline | stretch`
   * 
   * **Initial value**: `stretch`
   * @deprecated
   */
  MozBoxAlign?: BoxAlign | undefined;
  /**
   * The **`box-direction`** CSS property specifies whether a box lays out its contents normally (from the top or left edge), or in reverse (from the bottom or right edge).
   * 
   * **Syntax**: `normal | reverse | inherit`
   * 
   * **Initial value**: `normal`
   * @deprecated
   */
  MozBoxDirection?: BoxDirection | undefined;
  /**
   * The **`-moz-box-flex`** and **`-webkit-box-flex`** CSS properties specify how a `-moz-box` or `-webkit-box` grows to fill the box that contains it, in the direction of the containing box's layout.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  MozBoxFlex?: BoxFlex | undefined;
  /**
   * The **`box-ordinal-group`** CSS property assigns the flexbox's child elements to an ordinal group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  MozBoxOrdinalGroup?: BoxOrdinalGroup | undefined;
  /**
   * The **`box-orient`** CSS property sets whether an element lays out its contents horizontally or vertically.
   * 
   * **Syntax**: `horizontal | vertical | inline-axis | block-axis | inherit`
   * 
   * **Initial value**: `inline-axis` (`horizontal` in XUL)
   * @deprecated
   */
  MozBoxOrient?: BoxOrient | undefined;
  /**
   * The **`-moz-box-pack`** and **`-webkit-box-pack`** CSS properties specify how a `-moz-box` or `-webkit-box` packs its contents in the direction of its layout. The effect of this is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | justify`
   * 
   * **Initial value**: `start`
   * @deprecated
   */
  MozBoxPack?: BoxPack | undefined;
  /**
   * The **`box-shadow`** CSS property adds shadow effects around an element's frame. You can set multiple effects separated by commas. A box shadow is described by X and Y offsets relative to the element, blur and spread radius, and color.
   * 
   * **Syntax**: `none | <shadow>#`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  MozBoxShadow?: BoxShadow | undefined;
  /**
   * The non-standard **`-moz-float-edge`** CSS property specifies whether the height and width properties of the element include the margin, border, or padding thickness.
   * 
   * **Syntax**: `border-box | content-box | margin-box | padding-box`
   * 
   * **Initial value**: `content-box`
   * @deprecated
   */
  MozFloatEdge?: MozFloatEdge | undefined;
  /**
   * The **`-moz-force-broken-image-icon`** extended CSS property can be used to force the broken image icon to be shown even when a broken image has an `alt` attribute.
   * 
   * **Syntax**: `0 | 1`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  MozForceBrokenImageIcon?: MozForceBrokenImageIcon | undefined;
  /**
   * The **`opacity`** CSS property sets the opacity of an element. Opacity is the degree to which content behind an element is hidden, and is the opposite of transparency.
   * 
   * **Syntax**: `<alpha-value>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  MozOpacity?: Opacity | undefined;
  /**
   * The **`outline`** CSS shorthand property set all the outline properties in a single declaration.
   * 
   * **Syntax**: `[ <'outline-color'> || <'outline-style'> || <'outline-width'> ]`
   * @deprecated
   */
  MozOutline?: Outline<TLength> | undefined;
  /**
   * The **`outline-color`** CSS property sets the color of an element's outline.
   * 
   * **Syntax**: `<color> | invert`
   * 
   * **Initial value**: `invert`, for browsers supporting it, `currentColor` for the other
   * @deprecated
   */
  MozOutlineColor?: OutlineColor | undefined;
  /**
   * In Mozilla applications like Firefox, the **`-moz-outline-radius`** CSS shorthand property can be used to give an element's `outline` rounded corners.
   * 
   * **Syntax**: `<outline-radius>{1,4} [ / <outline-radius>{1,4} ]?`
   * @deprecated
   */
  MozOutlineRadius?: MozOutlineRadius<TLength> | undefined;
  /**
   * In Mozilla applications, the **`-moz-outline-radius-bottomleft`** CSS property can be used to round the bottom-left corner of an element's `outline`.
   * 
   * **Syntax**: `<outline-radius>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  MozOutlineRadiusBottomleft?: MozOutlineRadiusBottomleft<TLength> | undefined;
  /**
   * In Mozilla applications, the **`-moz-outline-radius-bottomright`** CSS property can be used to round the bottom-right corner of an element's `outline`.
   * 
   * **Syntax**: `<outline-radius>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  MozOutlineRadiusBottomright?: MozOutlineRadiusBottomright<TLength> | undefined;
  /**
   * In Mozilla applications, the **`-moz-outline-radius-topleft`** CSS property can be used to round the top-left corner of an element's `outline`.
   * 
   * **Syntax**: `<outline-radius>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  MozOutlineRadiusTopleft?: MozOutlineRadiusTopleft<TLength> | undefined;
  /**
   * In Mozilla applications, the **`-moz-outline-radius-topright`** CSS property can be used to round the top-right corner of an element's `outline`.
   * 
   * **Syntax**: `<outline-radius>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  MozOutlineRadiusTopright?: MozOutlineRadiusTopright<TLength> | undefined;
  /**
   * The **`outline-style`** CSS property sets the style of an element's outline. An outline is a line that is drawn around an element, outside the `border`.
   * 
   * **Syntax**: `auto | <'border-style'>`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  MozOutlineStyle?: OutlineStyle | undefined;
  /**
   * The CSS **`outline-width`** property sets the thickness of an element's outline. An outline is a line that is drawn around an element, outside the `border`.
   * 
   * **Syntax**: `<line-width>`
   * 
   * **Initial value**: `medium`
   * @deprecated
   */
  MozOutlineWidth?: OutlineWidth<TLength> | undefined;
  /**
   * The **`text-align-last`** CSS property sets how the last line of a block or a line, right before a forced line break, is aligned.
   * 
   * **Syntax**: `auto | start | end | left | right | center | justify`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  MozTextAlignLast?: TextAlignLast | undefined;
  /**
   * The **`text-decoration-color`** CSS property sets the color of decorations added to text by `text-decoration-line`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * @deprecated
   */
  MozTextDecorationColor?: TextDecorationColor | undefined;
  /**
   * The **`text-decoration-line`** CSS property sets the kind of decoration that is used on text in an element, such as an underline or overline.
   * 
   * **Syntax**: `none | [ underline || overline || line-through || blink ] | spelling-error | grammar-error`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  MozTextDecorationLine?: TextDecorationLine | undefined;
  /**
   * The **`text-decoration-style`** CSS property sets the style of the lines specified by `text-decoration-line`. The style applies to all lines that are set with `text-decoration-line`.
   * 
   * **Syntax**: `solid | double | dotted | dashed | wavy`
   * 
   * **Initial value**: `solid`
   * @deprecated
   */
  MozTextDecorationStyle?: TextDecorationStyle | undefined;
  /**
   * In Mozilla applications, **`-moz-user-input`** determines if an element will accept user input.
   * 
   * **Syntax**: `auto | none | enabled | disabled`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  MozUserInput?: MozUserInput | undefined;
  /**
   * The **`ime-mode`** CSS property controls the state of the input method editor (IME) for text fields. This property is obsolete.
   * 
   * **Syntax**: `auto | normal | active | inactive | disabled`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  msImeMode?: ImeMode | undefined;
  /**
   * The **`animation`** shorthand CSS property applies an animation between styles. It is a shorthand for `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`, and `animation-play-state`.
   * 
   * **Syntax**: `<single-animation>#`
   * @deprecated
   */
  OAnimation?: Animation<TTime> | undefined;
  /**
   * The **`animation-delay`** CSS property specifies the amount of time to wait from applying the animation to an element before beginning to perform the animation. The animation can start later, immediately from its beginning, or immediately and partway through the animation.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * @deprecated
   */
  OAnimationDelay?: AnimationDelay<TTime> | undefined;
  /**
   * The **`animation-direction`** CSS property sets whether an animation should play forward, backward, or alternate back and forth between playing the sequence forward and backward.
   * 
   * **Syntax**: `<single-animation-direction>#`
   * 
   * **Initial value**: `normal`
   * @deprecated
   */
  OAnimationDirection?: AnimationDirection | undefined;
  /**
   * The **`animation-duration`** CSS property sets the length of time that an animation takes to complete one cycle.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * @deprecated
   */
  OAnimationDuration?: AnimationDuration<TTime> | undefined;
  /**
   * The **`animation-fill-mode`** CSS property sets how a CSS animation applies styles to its target before and after its execution.
   * 
   * **Syntax**: `<single-animation-fill-mode>#`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  OAnimationFillMode?: AnimationFillMode | undefined;
  /**
   * The **`animation-iteration-count`** CSS property sets the number of times an animation sequence should be played before stopping.
   * 
   * **Syntax**: `<single-animation-iteration-count>#`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  OAnimationIterationCount?: AnimationIterationCount | undefined;
  /**
   * The **`animation-name`** CSS property specifies the names of one or more `@keyframes` at-rules describing the animation or animations to apply to the element.
   * 
   * **Syntax**: `[ none | <keyframes-name> ]#`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  OAnimationName?: AnimationName | undefined;
  /**
   * The **`animation-play-state`** CSS property sets whether an animation is running or paused.
   * 
   * **Syntax**: `<single-animation-play-state>#`
   * 
   * **Initial value**: `running`
   * @deprecated
   */
  OAnimationPlayState?: AnimationPlayState | undefined;
  /**
   * The **`animation-timing-function`** CSS property sets how an animation progresses through the duration of each cycle.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   * @deprecated
   */
  OAnimationTimingFunction?: AnimationTimingFunction | undefined;
  /**
   * The **`background-size`** CSS property sets the size of the element's background image. The image can be left to its natural size, stretched, or constrained to fit the available space.
   * 
   * **Syntax**: `<bg-size>#`
   * 
   * **Initial value**: `auto auto`
   * @deprecated
   */
  OBackgroundSize?: BackgroundSize<TLength> | undefined;
  /**
   * The **`border-image`** CSS property draws an image around a given element. It replaces the element's regular border.
   * 
   * **Syntax**: `<'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>`
   * @deprecated
   */
  OBorderImage?: BorderImage | undefined;
  /**
   * The **`object-fit`** CSS property sets how the content of a replaced element, such as an `<img>` or `<video>`, should be resized to fit its container.
   * 
   * **Syntax**: `fill | contain | cover | none | scale-down`
   * 
   * **Initial value**: `fill`
   * @deprecated
   */
  OObjectFit?: ObjectFit | undefined;
  /**
   * The **`object-position`** CSS property specifies the alignment of the selected replaced element's contents within the element's box. Areas of the box which aren't covered by the replaced element's object will show the element's background.
   * 
   * **Syntax**: `<position>`
   * 
   * **Initial value**: `50% 50%`
   * @deprecated
   */
  OObjectPosition?: ObjectPosition<TLength> | undefined;
  /**
   * The **`tab-size`** CSS property is used to customize the width of tab characters (U+0009).
   * 
   * **Syntax**: `<integer> | <length>`
   * 
   * **Initial value**: `8`
   * @deprecated
   */
  OTabSize?: TabSize<TLength> | undefined;
  /**
   * The **`text-overflow`** CSS property sets how hidden overflow content is signaled to users. It can be clipped, display an ellipsis ('`…`'), or display a custom string.
   * 
   * **Syntax**: `[ clip | ellipsis | <string> ]{1,2}`
   * 
   * **Initial value**: `clip`
   * @deprecated
   */
  OTextOverflow?: TextOverflow | undefined;
  /**
   * The **`transform`** CSS property lets you rotate, scale, skew, or translate an element. It modifies the coordinate space of the CSS visual formatting model.
   * 
   * **Syntax**: `none | <transform-list>`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  OTransform?: Transform | undefined;
  /**
   * The **`transform-origin`** CSS property sets the origin for an element's transformations.
   * 
   * **Syntax**: `[ <length-percentage> | left | center | right | top | bottom ] | [ [ <length-percentage> | left | center | right ] && [ <length-percentage> | top | center | bottom ] ] <length>?`
   * 
   * **Initial value**: `50% 50% 0`
   * @deprecated
   */
  OTransformOrigin?: TransformOrigin<TLength> | undefined;
  /**
   * The **`transition`** CSS property is a shorthand property for `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.
   * 
   * **Syntax**: `<single-transition>#`
   * @deprecated
   */
  OTransition?: Transition<TTime> | undefined;
  /**
   * The **`transition-delay`** CSS property specifies the duration to wait before starting a property's transition effect when its value changes.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * @deprecated
   */
  OTransitionDelay?: TransitionDelay<TTime> | undefined;
  /**
   * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * @deprecated
   */
  OTransitionDuration?: TransitionDuration<TTime> | undefined;
  /**
   * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
   * 
   * **Syntax**: `none | <single-transition-property>#`
   * 
   * **Initial value**: all
   * @deprecated
   */
  OTransitionProperty?: TransitionProperty | undefined;
  /**
   * The **`transition-timing-function`** CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   * @deprecated
   */
  OTransitionTimingFunction?: TransitionTimingFunction | undefined;
  /**
   * The **`box-align`** CSS property specifies how an element aligns its contents across its layout in a perpendicular direction. The effect of the property is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | baseline | stretch`
   * 
   * **Initial value**: `stretch`
   * @deprecated
   */
  WebkitBoxAlign?: BoxAlign | undefined;
  /**
   * The **`box-direction`** CSS property specifies whether a box lays out its contents normally (from the top or left edge), or in reverse (from the bottom or right edge).
   * 
   * **Syntax**: `normal | reverse | inherit`
   * 
   * **Initial value**: `normal`
   * @deprecated
   */
  WebkitBoxDirection?: BoxDirection | undefined;
  /**
   * The **`-moz-box-flex`** and **`-webkit-box-flex`** CSS properties specify how a `-moz-box` or `-webkit-box` grows to fill the box that contains it, in the direction of the containing box's layout.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  WebkitBoxFlex?: BoxFlex | undefined;
  /**
   * The **`box-flex-group`** CSS property assigns the flexbox's child elements to a flex group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  WebkitBoxFlexGroup?: BoxFlexGroup | undefined;
  /**
   * The **`box-lines`** CSS property determines whether the box may have a single or multiple lines (rows for horizontally oriented boxes, columns for vertically oriented boxes).
   * 
   * **Syntax**: `single | multiple`
   * 
   * **Initial value**: `single`
   * @deprecated
   */
  WebkitBoxLines?: BoxLines | undefined;
  /**
   * The **`box-ordinal-group`** CSS property assigns the flexbox's child elements to an ordinal group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  WebkitBoxOrdinalGroup?: BoxOrdinalGroup | undefined;
  /**
   * The **`box-orient`** CSS property sets whether an element lays out its contents horizontally or vertically.
   * 
   * **Syntax**: `horizontal | vertical | inline-axis | block-axis | inherit`
   * 
   * **Initial value**: `inline-axis` (`horizontal` in XUL)
   * @deprecated
   */
  WebkitBoxOrient?: BoxOrient | undefined;
  /**
   * The **`-moz-box-pack`** and **`-webkit-box-pack`** CSS properties specify how a `-moz-box` or `-webkit-box` packs its contents in the direction of its layout. The effect of this is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | justify`
   * 
   * **Initial value**: `start`
   * @deprecated
   */
  WebkitBoxPack?: BoxPack | undefined;
  /**
   * The **`scroll-snap-points-x`** CSS property defines the horizontal positioning of snap points within the content of the scroll container they are applied to.
   * 
   * **Syntax**: `none | repeat( <length-percentage> )`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  WebkitScrollSnapPointsX?: ScrollSnapPointsX | undefined;
  /**
   * The **`scroll-snap-points-y`** CSS property defines the vertical positioning of snap points within the content of the scroll container they are applied to.
   * 
   * **Syntax**: `none | repeat( <length-percentage> )`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  WebkitScrollSnapPointsY?: ScrollSnapPointsY | undefined;
}

export interface SvgProperties<TLength = (string & {}) | 0, TTime = string & {}> {
  alignmentBaseline?: AlignmentBaseline | undefined;
  baselineShift?: BaselineShift<TLength> | undefined;
  clip?: Clip | undefined;
  clipPath?: ClipPath | undefined;
  clipRule?: ClipRule | undefined;
  color?: Color | undefined;
  colorInterpolation?: ColorInterpolation | undefined;
  colorRendering?: ColorRendering | undefined;
  cursor?: Cursor | undefined;
  direction?: Direction | undefined;
  display?: Display | undefined;
  dominantBaseline?: DominantBaseline | undefined;
  fill?: Fill | undefined;
  fillOpacity?: FillOpacity | undefined;
  fillRule?: FillRule | undefined;
  filter?: Filter | undefined;
  floodColor?: FloodColor | undefined;
  floodOpacity?: FloodOpacity | undefined;
  font?: Font | undefined;
  fontFamily?: FontFamily | undefined;
  fontSize?: FontSize<TLength> | undefined;
  fontSizeAdjust?: FontSizeAdjust | undefined;
  fontStretch?: FontStretch | undefined;
  fontStyle?: FontStyle | undefined;
  fontVariant?: FontVariant | undefined;
  fontWeight?: FontWeight | undefined;
  glyphOrientationVertical?: GlyphOrientationVertical | undefined;
  imageRendering?: ImageRendering | undefined;
  letterSpacing?: LetterSpacing<TLength> | undefined;
  lightingColor?: LightingColor | undefined;
  lineHeight?: LineHeight<TLength> | undefined;
  marker?: Marker | undefined;
  markerEnd?: MarkerEnd | undefined;
  markerMid?: MarkerMid | undefined;
  markerStart?: MarkerStart | undefined;
  mask?: Mask<TLength> | undefined;
  opacity?: Opacity | undefined;
  overflow?: Overflow | undefined;
  paintOrder?: PaintOrder | undefined;
  pointerEvents?: PointerEvents | undefined;
  shapeRendering?: ShapeRendering | undefined;
  stopColor?: StopColor | undefined;
  stopOpacity?: StopOpacity | undefined;
  stroke?: Stroke | undefined;
  strokeDasharray?: StrokeDasharray<TLength> | undefined;
  strokeDashoffset?: StrokeDashoffset<TLength> | undefined;
  strokeLinecap?: StrokeLinecap | undefined;
  strokeLinejoin?: StrokeLinejoin | undefined;
  strokeMiterlimit?: StrokeMiterlimit | undefined;
  strokeOpacity?: StrokeOpacity | undefined;
  strokeWidth?: StrokeWidth<TLength> | undefined;
  textAnchor?: TextAnchor | undefined;
  textDecoration?: TextDecoration<TLength> | undefined;
  textRendering?: TextRendering | undefined;
  unicodeBidi?: UnicodeBidi | undefined;
  vectorEffect?: VectorEffect | undefined;
  visibility?: Visibility | undefined;
  whiteSpace?: WhiteSpace | undefined;
  wordSpacing?: WordSpacing<TLength> | undefined;
  writingMode?: WritingMode | undefined;
}

export interface StandardPropertiesHyphen<TLength = (string & {}) | 0, TTime = string & {}> extends StandardLonghandPropertiesHyphen<TLength, TTime>, StandardShorthandPropertiesHyphen<TLength, TTime> {}

export interface VendorPropertiesHyphen<TLength = (string & {}) | 0, TTime = string & {}> extends VendorLonghandPropertiesHyphen<TLength, TTime>, VendorShorthandPropertiesHyphen<TLength, TTime> {}

export interface ObsoletePropertiesHyphen<TLength = (string & {}) | 0, TTime = string & {}> {
  /**
   * In combination with `elevation`, the **`azimuth`** CSS property enables different audio sources to be positioned spatially for aural presentation. This is important in that it provides a natural way to tell several voices apart, as each can be positioned to originate at a different location on the sound stage. Stereo output produce a lateral sound stage, while binaural headphones and multi-speaker setups allow for a fully three-dimensional stage.
   * 
   * **Syntax**: `<angle> | [ [ left-side | far-left | left | center-left | center | center-right | right | far-right | right-side ] || behind ] | leftwards | rightwards`
   * 
   * **Initial value**: `center`
   * @deprecated
   */
  azimuth?: Azimuth | undefined;
  /**
   * The **`box-align`** CSS property specifies how an element aligns its contents across its layout in a perpendicular direction. The effect of the property is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | baseline | stretch`
   * 
   * **Initial value**: `stretch`
   * @deprecated
   */
  "box-align"?: BoxAlign | undefined;
  /**
   * The **`box-direction`** CSS property specifies whether a box lays out its contents normally (from the top or left edge), or in reverse (from the bottom or right edge).
   * 
   * **Syntax**: `normal | reverse | inherit`
   * 
   * **Initial value**: `normal`
   * @deprecated
   */
  "box-direction"?: BoxDirection | undefined;
  /**
   * The **`-moz-box-flex`** and **`-webkit-box-flex`** CSS properties specify how a `-moz-box` or `-webkit-box` grows to fill the box that contains it, in the direction of the containing box's layout.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "box-flex"?: BoxFlex | undefined;
  /**
   * The **`box-flex-group`** CSS property assigns the flexbox's child elements to a flex group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  "box-flex-group"?: BoxFlexGroup | undefined;
  /**
   * The **`box-lines`** CSS property determines whether the box may have a single or multiple lines (rows for horizontally oriented boxes, columns for vertically oriented boxes).
   * 
   * **Syntax**: `single | multiple`
   * 
   * **Initial value**: `single`
   * @deprecated
   */
  "box-lines"?: BoxLines | undefined;
  /**
   * The **`box-ordinal-group`** CSS property assigns the flexbox's child elements to an ordinal group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  "box-ordinal-group"?: BoxOrdinalGroup | undefined;
  /**
   * The **`box-orient`** CSS property sets whether an element lays out its contents horizontally or vertically.
   * 
   * **Syntax**: `horizontal | vertical | inline-axis | block-axis | inherit`
   * 
   * **Initial value**: `inline-axis` (`horizontal` in XUL)
   * @deprecated
   */
  "box-orient"?: BoxOrient | undefined;
  /**
   * The **`-moz-box-pack`** and **`-webkit-box-pack`** CSS properties specify how a `-moz-box` or `-webkit-box` packs its contents in the direction of its layout. The effect of this is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | justify`
   * 
   * **Initial value**: `start`
   * @deprecated
   */
  "box-pack"?: BoxPack | undefined;
  /**
   * The **`clip`** CSS property defines a visible portion of an element. The `clip` property applies only to absolutely positioned elements — that is, elements with `position:absolute` or `position:fixed`.
   * 
   * **Syntax**: `<shape> | auto`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  clip?: Clip | undefined;
  /**
   * The **`column-gap`** CSS property sets the size of the gap (gutter) between an element's columns.
   * 
   * **Syntax**: `<length-percentage>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "grid-column-gap"?: GridColumnGap<TLength> | undefined;
  /**
   * The **`gap`** CSS property sets the gaps (gutters) between rows and columns. It is a shorthand for `row-gap` and `column-gap`.
   * 
   * **Syntax**: `<'grid-row-gap'> <'grid-column-gap'>?`
   * @deprecated
   */
  "grid-gap"?: GridGap<TLength> | undefined;
  /**
   * The **`row-gap`** CSS property sets the size of the gap (gutter) between an element's grid rows.
   * 
   * **Syntax**: `<length-percentage>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "grid-row-gap"?: GridRowGap<TLength> | undefined;
  /**
   * The **`ime-mode`** CSS property controls the state of the input method editor (IME) for text fields. This property is obsolete.
   * 
   * **Syntax**: `auto | normal | active | inactive | disabled`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  "ime-mode"?: ImeMode | undefined;
  /**
   * The **`inset-block`** CSS property defines the logical block start and end offsets of an element, which maps to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top` and `bottom`, or `right` and `left` properties depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>{1,2}`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  "offset-block"?: InsetBlock<TLength> | undefined;
  /**
   * The **`inset-block-end`** CSS property defines the logical block end offset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  "offset-block-end"?: InsetBlockEnd<TLength> | undefined;
  /**
   * The **`inset-block-start`** CSS property defines the logical block start offset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  "offset-block-start"?: InsetBlockStart<TLength> | undefined;
  /**
   * The **`inset-inline`** CSS property defines the logical start and end offsets of an element in the inline direction, which maps to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top` and `bottom`, or `right` and `left` properties depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>{1,2}`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  "offset-inline"?: InsetInline<TLength> | undefined;
  /**
   * The **`inset-inline-end`** CSS property defines the logical inline end inset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  "offset-inline-end"?: InsetInlineEnd<TLength> | undefined;
  /**
   * The **`inset-inline-start`** CSS property defines the logical inline start inset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  "offset-inline-start"?: InsetInlineStart<TLength> | undefined;
  /**
   * The **`scroll-snap-coordinate`** CSS property defines the x and y coordinate positions within an element that will align with its nearest ancestor scroll container's `scroll-snap-destination` for each respective axis.
   * 
   * **Syntax**: `none | <position>#`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "scroll-snap-coordinate"?: ScrollSnapCoordinate<TLength> | undefined;
  /**
   * The **`scroll-snap-destination`** CSS property defines the position in x and y coordinates within the scroll container's visual viewport which element snap points align with.
   * 
   * **Syntax**: `<position>`
   * 
   * **Initial value**: `0px 0px`
   * @deprecated
   */
  "scroll-snap-destination"?: ScrollSnapDestination<TLength> | undefined;
  /**
   * The **`scroll-snap-points-x`** CSS property defines the horizontal positioning of snap points within the content of the scroll container they are applied to.
   * 
   * **Syntax**: `none | repeat( <length-percentage> )`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "scroll-snap-points-x"?: ScrollSnapPointsX | undefined;
  /**
   * The **`scroll-snap-points-y`** CSS property defines the vertical positioning of snap points within the content of the scroll container they are applied to.
   * 
   * **Syntax**: `none | repeat( <length-percentage> )`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "scroll-snap-points-y"?: ScrollSnapPointsY | undefined;
  /**
   * The **`scroll-snap-type-x`** CSS property defines how strictly snap points are enforced on the horizontal axis of the scroll container in case there is one.
   * 
   * **Syntax**: `none | mandatory | proximity`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "scroll-snap-type-x"?: ScrollSnapTypeX | undefined;
  /**
   * The **`scroll-snap-type-y`** CSS property defines how strictly snap points are enforced on the vertical axis of the scroll container in case there is one.
   * 
   * **Syntax**: `none | mandatory | proximity`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "scroll-snap-type-y"?: ScrollSnapTypeY | undefined;
  /**
   * The **`box-align`** CSS property specifies how an element aligns its contents across its layout in a perpendicular direction. The effect of the property is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | baseline | stretch`
   * 
   * **Initial value**: `stretch`
   * @deprecated
   */
  "-khtml-box-align"?: BoxAlign | undefined;
  /**
   * The **`box-direction`** CSS property specifies whether a box lays out its contents normally (from the top or left edge), or in reverse (from the bottom or right edge).
   * 
   * **Syntax**: `normal | reverse | inherit`
   * 
   * **Initial value**: `normal`
   * @deprecated
   */
  "-khtml-box-direction"?: BoxDirection | undefined;
  /**
   * The **`-moz-box-flex`** and **`-webkit-box-flex`** CSS properties specify how a `-moz-box` or `-webkit-box` grows to fill the box that contains it, in the direction of the containing box's layout.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "-khtml-box-flex"?: BoxFlex | undefined;
  /**
   * The **`box-flex-group`** CSS property assigns the flexbox's child elements to a flex group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  "-khtml-box-flex-group"?: BoxFlexGroup | undefined;
  /**
   * The **`box-lines`** CSS property determines whether the box may have a single or multiple lines (rows for horizontally oriented boxes, columns for vertically oriented boxes).
   * 
   * **Syntax**: `single | multiple`
   * 
   * **Initial value**: `single`
   * @deprecated
   */
  "-khtml-box-lines"?: BoxLines | undefined;
  /**
   * The **`box-ordinal-group`** CSS property assigns the flexbox's child elements to an ordinal group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  "-khtml-box-ordinal-group"?: BoxOrdinalGroup | undefined;
  /**
   * The **`box-orient`** CSS property sets whether an element lays out its contents horizontally or vertically.
   * 
   * **Syntax**: `horizontal | vertical | inline-axis | block-axis | inherit`
   * 
   * **Initial value**: `inline-axis` (`horizontal` in XUL)
   * @deprecated
   */
  "-khtml-box-orient"?: BoxOrient | undefined;
  /**
   * The **`-moz-box-pack`** and **`-webkit-box-pack`** CSS properties specify how a `-moz-box` or `-webkit-box` packs its contents in the direction of its layout. The effect of this is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | justify`
   * 
   * **Initial value**: `start`
   * @deprecated
   */
  "-khtml-box-pack"?: BoxPack | undefined;
  /**
   * The **`line-break`** CSS property sets how to break lines of Chinese, Japanese, or Korean (CJK) text when working with punctuation and symbols.
   * 
   * **Syntax**: `auto | loose | normal | strict | anywhere`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  "-khtml-line-break"?: LineBreak | undefined;
  /**
   * The **`opacity`** CSS property sets the opacity of an element. Opacity is the degree to which content behind an element is hidden, and is the opposite of transparency.
   * 
   * **Syntax**: `<alpha-value>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  "-khtml-opacity"?: Opacity | undefined;
  /**
   * The **`user-select`** CSS property controls whether the user can select text. This doesn't have any effect on content loaded as part of a browser's user interface (its chrome), except in textboxes.
   * 
   * **Syntax**: `auto | text | none | contain | all`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  "-khtml-user-select"?: UserSelect | undefined;
  /**
   * The **`background-clip`** CSS property sets whether an element's background extends underneath its border box, padding box, or content box.
   * 
   * **Syntax**: `<box>#`
   * 
   * **Initial value**: `border-box`
   * @deprecated
   */
  "-moz-background-clip"?: BackgroundClip | undefined;
  /**
   * The **`box-decoration-break`** CSS property specifies how an element's fragments should be rendered when broken across multiple lines, columns, or pages.
   * 
   * **Syntax**: `slice | clone`
   * 
   * **Initial value**: `slice`
   * @deprecated
   */
  "-moz-background-inline-policy"?: BoxDecorationBreak | undefined;
  /**
   * The **`background-origin`** CSS property sets the background's origin: from the border start, inside the border, or inside the padding.
   * 
   * **Syntax**: `<box>#`
   * 
   * **Initial value**: `padding-box`
   * @deprecated
   */
  "-moz-background-origin"?: BackgroundOrigin | undefined;
  /**
   * The **`background-size`** CSS property sets the size of the element's background image. The image can be left to its natural size, stretched, or constrained to fit the available space.
   * 
   * **Syntax**: `<bg-size>#`
   * 
   * **Initial value**: `auto auto`
   * @deprecated
   */
  "-moz-background-size"?: BackgroundSize<TLength> | undefined;
  /**
   * The **`-moz-binding`** CSS property is used by Mozilla-based applications to attach an XBL binding to a DOM element.
   * 
   * **Syntax**: `<url> | none`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "-moz-binding"?: MozBinding | undefined;
  /**
   * The **`border-radius`** CSS property rounds the corners of an element's outer border edge. You can set a single radius to make circular corners, or two radii to make elliptical corners.
   * 
   * **Syntax**: `<length-percentage>{1,4} [ / <length-percentage>{1,4} ]?`
   * @deprecated
   */
  "-moz-border-radius"?: BorderRadius<TLength> | undefined;
  /**
   * The **`border-bottom-left-radius`** CSS property rounds the bottom-left corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "-moz-border-radius-bottomleft"?: BorderBottomLeftRadius<TLength> | undefined;
  /**
   * The **`border-bottom-right-radius`** CSS property rounds the bottom-right corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "-moz-border-radius-bottomright"?: BorderBottomRightRadius<TLength> | undefined;
  /**
   * The **`border-top-left-radius`** CSS property rounds the top-left corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "-moz-border-radius-topleft"?: BorderTopLeftRadius<TLength> | undefined;
  /**
   * The **`border-top-right-radius`** CSS property rounds the top-right corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "-moz-border-radius-topright"?: BorderTopRightRadius<TLength> | undefined;
  /**
   * The **`box-align`** CSS property specifies how an element aligns its contents across its layout in a perpendicular direction. The effect of the property is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | baseline | stretch`
   * 
   * **Initial value**: `stretch`
   * @deprecated
   */
  "-moz-box-align"?: BoxAlign | undefined;
  /**
   * The **`box-direction`** CSS property specifies whether a box lays out its contents normally (from the top or left edge), or in reverse (from the bottom or right edge).
   * 
   * **Syntax**: `normal | reverse | inherit`
   * 
   * **Initial value**: `normal`
   * @deprecated
   */
  "-moz-box-direction"?: BoxDirection | undefined;
  /**
   * The **`-moz-box-flex`** and **`-webkit-box-flex`** CSS properties specify how a `-moz-box` or `-webkit-box` grows to fill the box that contains it, in the direction of the containing box's layout.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "-moz-box-flex"?: BoxFlex | undefined;
  /**
   * The **`box-ordinal-group`** CSS property assigns the flexbox's child elements to an ordinal group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  "-moz-box-ordinal-group"?: BoxOrdinalGroup | undefined;
  /**
   * The **`box-orient`** CSS property sets whether an element lays out its contents horizontally or vertically.
   * 
   * **Syntax**: `horizontal | vertical | inline-axis | block-axis | inherit`
   * 
   * **Initial value**: `inline-axis` (`horizontal` in XUL)
   * @deprecated
   */
  "-moz-box-orient"?: BoxOrient | undefined;
  /**
   * The **`-moz-box-pack`** and **`-webkit-box-pack`** CSS properties specify how a `-moz-box` or `-webkit-box` packs its contents in the direction of its layout. The effect of this is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | justify`
   * 
   * **Initial value**: `start`
   * @deprecated
   */
  "-moz-box-pack"?: BoxPack | undefined;
  /**
   * The **`box-shadow`** CSS property adds shadow effects around an element's frame. You can set multiple effects separated by commas. A box shadow is described by X and Y offsets relative to the element, blur and spread radius, and color.
   * 
   * **Syntax**: `none | <shadow>#`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "-moz-box-shadow"?: BoxShadow | undefined;
  /**
   * The non-standard **`-moz-float-edge`** CSS property specifies whether the height and width properties of the element include the margin, border, or padding thickness.
   * 
   * **Syntax**: `border-box | content-box | margin-box | padding-box`
   * 
   * **Initial value**: `content-box`
   * @deprecated
   */
  "-moz-float-edge"?: MozFloatEdge | undefined;
  /**
   * The **`-moz-force-broken-image-icon`** extended CSS property can be used to force the broken image icon to be shown even when a broken image has an `alt` attribute.
   * 
   * **Syntax**: `0 | 1`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "-moz-force-broken-image-icon"?: MozForceBrokenImageIcon | undefined;
  /**
   * The **`opacity`** CSS property sets the opacity of an element. Opacity is the degree to which content behind an element is hidden, and is the opposite of transparency.
   * 
   * **Syntax**: `<alpha-value>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  "-moz-opacity"?: Opacity | undefined;
  /**
   * The **`outline`** CSS shorthand property set all the outline properties in a single declaration.
   * 
   * **Syntax**: `[ <'outline-color'> || <'outline-style'> || <'outline-width'> ]`
   * @deprecated
   */
  "-moz-outline"?: Outline<TLength> | undefined;
  /**
   * The **`outline-color`** CSS property sets the color of an element's outline.
   * 
   * **Syntax**: `<color> | invert`
   * 
   * **Initial value**: `invert`, for browsers supporting it, `currentColor` for the other
   * @deprecated
   */
  "-moz-outline-color"?: OutlineColor | undefined;
  /**
   * In Mozilla applications like Firefox, the **`-moz-outline-radius`** CSS shorthand property can be used to give an element's `outline` rounded corners.
   * 
   * **Syntax**: `<outline-radius>{1,4} [ / <outline-radius>{1,4} ]?`
   * @deprecated
   */
  "-moz-outline-radius"?: MozOutlineRadius<TLength> | undefined;
  /**
   * In Mozilla applications, the **`-moz-outline-radius-bottomleft`** CSS property can be used to round the bottom-left corner of an element's `outline`.
   * 
   * **Syntax**: `<outline-radius>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "-moz-outline-radius-bottomleft"?: MozOutlineRadiusBottomleft<TLength> | undefined;
  /**
   * In Mozilla applications, the **`-moz-outline-radius-bottomright`** CSS property can be used to round the bottom-right corner of an element's `outline`.
   * 
   * **Syntax**: `<outline-radius>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "-moz-outline-radius-bottomright"?: MozOutlineRadiusBottomright<TLength> | undefined;
  /**
   * In Mozilla applications, the **`-moz-outline-radius-topleft`** CSS property can be used to round the top-left corner of an element's `outline`.
   * 
   * **Syntax**: `<outline-radius>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "-moz-outline-radius-topleft"?: MozOutlineRadiusTopleft<TLength> | undefined;
  /**
   * In Mozilla applications, the **`-moz-outline-radius-topright`** CSS property can be used to round the top-right corner of an element's `outline`.
   * 
   * **Syntax**: `<outline-radius>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "-moz-outline-radius-topright"?: MozOutlineRadiusTopright<TLength> | undefined;
  /**
   * The **`outline-style`** CSS property sets the style of an element's outline. An outline is a line that is drawn around an element, outside the `border`.
   * 
   * **Syntax**: `auto | <'border-style'>`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "-moz-outline-style"?: OutlineStyle | undefined;
  /**
   * The CSS **`outline-width`** property sets the thickness of an element's outline. An outline is a line that is drawn around an element, outside the `border`.
   * 
   * **Syntax**: `<line-width>`
   * 
   * **Initial value**: `medium`
   * @deprecated
   */
  "-moz-outline-width"?: OutlineWidth<TLength> | undefined;
  /**
   * The **`text-align-last`** CSS property sets how the last line of a block or a line, right before a forced line break, is aligned.
   * 
   * **Syntax**: `auto | start | end | left | right | center | justify`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  "-moz-text-align-last"?: TextAlignLast | undefined;
  /**
   * The **`text-decoration-color`** CSS property sets the color of decorations added to text by `text-decoration-line`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * @deprecated
   */
  "-moz-text-decoration-color"?: TextDecorationColor | undefined;
  /**
   * The **`text-decoration-line`** CSS property sets the kind of decoration that is used on text in an element, such as an underline or overline.
   * 
   * **Syntax**: `none | [ underline || overline || line-through || blink ] | spelling-error | grammar-error`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "-moz-text-decoration-line"?: TextDecorationLine | undefined;
  /**
   * The **`text-decoration-style`** CSS property sets the style of the lines specified by `text-decoration-line`. The style applies to all lines that are set with `text-decoration-line`.
   * 
   * **Syntax**: `solid | double | dotted | dashed | wavy`
   * 
   * **Initial value**: `solid`
   * @deprecated
   */
  "-moz-text-decoration-style"?: TextDecorationStyle | undefined;
  /**
   * In Mozilla applications, **`-moz-user-input`** determines if an element will accept user input.
   * 
   * **Syntax**: `auto | none | enabled | disabled`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  "-moz-user-input"?: MozUserInput | undefined;
  /**
   * The **`ime-mode`** CSS property controls the state of the input method editor (IME) for text fields. This property is obsolete.
   * 
   * **Syntax**: `auto | normal | active | inactive | disabled`
   * 
   * **Initial value**: `auto`
   * @deprecated
   */
  "-ms-ime-mode"?: ImeMode | undefined;
  /**
   * The **`animation`** shorthand CSS property applies an animation between styles. It is a shorthand for `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`, and `animation-play-state`.
   * 
   * **Syntax**: `<single-animation>#`
   * @deprecated
   */
  "-o-animation"?: Animation<TTime> | undefined;
  /**
   * The **`animation-delay`** CSS property specifies the amount of time to wait from applying the animation to an element before beginning to perform the animation. The animation can start later, immediately from its beginning, or immediately and partway through the animation.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * @deprecated
   */
  "-o-animation-delay"?: AnimationDelay<TTime> | undefined;
  /**
   * The **`animation-direction`** CSS property sets whether an animation should play forward, backward, or alternate back and forth between playing the sequence forward and backward.
   * 
   * **Syntax**: `<single-animation-direction>#`
   * 
   * **Initial value**: `normal`
   * @deprecated
   */
  "-o-animation-direction"?: AnimationDirection | undefined;
  /**
   * The **`animation-duration`** CSS property sets the length of time that an animation takes to complete one cycle.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * @deprecated
   */
  "-o-animation-duration"?: AnimationDuration<TTime> | undefined;
  /**
   * The **`animation-fill-mode`** CSS property sets how a CSS animation applies styles to its target before and after its execution.
   * 
   * **Syntax**: `<single-animation-fill-mode>#`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "-o-animation-fill-mode"?: AnimationFillMode | undefined;
  /**
   * The **`animation-iteration-count`** CSS property sets the number of times an animation sequence should be played before stopping.
   * 
   * **Syntax**: `<single-animation-iteration-count>#`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  "-o-animation-iteration-count"?: AnimationIterationCount | undefined;
  /**
   * The **`animation-name`** CSS property specifies the names of one or more `@keyframes` at-rules describing the animation or animations to apply to the element.
   * 
   * **Syntax**: `[ none | <keyframes-name> ]#`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "-o-animation-name"?: AnimationName | undefined;
  /**
   * The **`animation-play-state`** CSS property sets whether an animation is running or paused.
   * 
   * **Syntax**: `<single-animation-play-state>#`
   * 
   * **Initial value**: `running`
   * @deprecated
   */
  "-o-animation-play-state"?: AnimationPlayState | undefined;
  /**
   * The **`animation-timing-function`** CSS property sets how an animation progresses through the duration of each cycle.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   * @deprecated
   */
  "-o-animation-timing-function"?: AnimationTimingFunction | undefined;
  /**
   * The **`background-size`** CSS property sets the size of the element's background image. The image can be left to its natural size, stretched, or constrained to fit the available space.
   * 
   * **Syntax**: `<bg-size>#`
   * 
   * **Initial value**: `auto auto`
   * @deprecated
   */
  "-o-background-size"?: BackgroundSize<TLength> | undefined;
  /**
   * The **`border-image`** CSS property draws an image around a given element. It replaces the element's regular border.
   * 
   * **Syntax**: `<'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>`
   * @deprecated
   */
  "-o-border-image"?: BorderImage | undefined;
  /**
   * The **`object-fit`** CSS property sets how the content of a replaced element, such as an `<img>` or `<video>`, should be resized to fit its container.
   * 
   * **Syntax**: `fill | contain | cover | none | scale-down`
   * 
   * **Initial value**: `fill`
   * @deprecated
   */
  "-o-object-fit"?: ObjectFit | undefined;
  /**
   * The **`object-position`** CSS property specifies the alignment of the selected replaced element's contents within the element's box. Areas of the box which aren't covered by the replaced element's object will show the element's background.
   * 
   * **Syntax**: `<position>`
   * 
   * **Initial value**: `50% 50%`
   * @deprecated
   */
  "-o-object-position"?: ObjectPosition<TLength> | undefined;
  /**
   * The **`tab-size`** CSS property is used to customize the width of tab characters (U+0009).
   * 
   * **Syntax**: `<integer> | <length>`
   * 
   * **Initial value**: `8`
   * @deprecated
   */
  "-o-tab-size"?: TabSize<TLength> | undefined;
  /**
   * The **`text-overflow`** CSS property sets how hidden overflow content is signaled to users. It can be clipped, display an ellipsis ('`…`'), or display a custom string.
   * 
   * **Syntax**: `[ clip | ellipsis | <string> ]{1,2}`
   * 
   * **Initial value**: `clip`
   * @deprecated
   */
  "-o-text-overflow"?: TextOverflow | undefined;
  /**
   * The **`transform`** CSS property lets you rotate, scale, skew, or translate an element. It modifies the coordinate space of the CSS visual formatting model.
   * 
   * **Syntax**: `none | <transform-list>`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "-o-transform"?: Transform | undefined;
  /**
   * The **`transform-origin`** CSS property sets the origin for an element's transformations.
   * 
   * **Syntax**: `[ <length-percentage> | left | center | right | top | bottom ] | [ [ <length-percentage> | left | center | right ] && [ <length-percentage> | top | center | bottom ] ] <length>?`
   * 
   * **Initial value**: `50% 50% 0`
   * @deprecated
   */
  "-o-transform-origin"?: TransformOrigin<TLength> | undefined;
  /**
   * The **`transition`** CSS property is a shorthand property for `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.
   * 
   * **Syntax**: `<single-transition>#`
   * @deprecated
   */
  "-o-transition"?: Transition<TTime> | undefined;
  /**
   * The **`transition-delay`** CSS property specifies the duration to wait before starting a property's transition effect when its value changes.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * @deprecated
   */
  "-o-transition-delay"?: TransitionDelay<TTime> | undefined;
  /**
   * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * @deprecated
   */
  "-o-transition-duration"?: TransitionDuration<TTime> | undefined;
  /**
   * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
   * 
   * **Syntax**: `none | <single-transition-property>#`
   * 
   * **Initial value**: all
   * @deprecated
   */
  "-o-transition-property"?: TransitionProperty | undefined;
  /**
   * The **`transition-timing-function`** CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   * @deprecated
   */
  "-o-transition-timing-function"?: TransitionTimingFunction | undefined;
  /**
   * The **`box-align`** CSS property specifies how an element aligns its contents across its layout in a perpendicular direction. The effect of the property is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | baseline | stretch`
   * 
   * **Initial value**: `stretch`
   * @deprecated
   */
  "-webkit-box-align"?: BoxAlign | undefined;
  /**
   * The **`box-direction`** CSS property specifies whether a box lays out its contents normally (from the top or left edge), or in reverse (from the bottom or right edge).
   * 
   * **Syntax**: `normal | reverse | inherit`
   * 
   * **Initial value**: `normal`
   * @deprecated
   */
  "-webkit-box-direction"?: BoxDirection | undefined;
  /**
   * The **`-moz-box-flex`** and **`-webkit-box-flex`** CSS properties specify how a `-moz-box` or `-webkit-box` grows to fill the box that contains it, in the direction of the containing box's layout.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   * @deprecated
   */
  "-webkit-box-flex"?: BoxFlex | undefined;
  /**
   * The **`box-flex-group`** CSS property assigns the flexbox's child elements to a flex group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  "-webkit-box-flex-group"?: BoxFlexGroup | undefined;
  /**
   * The **`box-lines`** CSS property determines whether the box may have a single or multiple lines (rows for horizontally oriented boxes, columns for vertically oriented boxes).
   * 
   * **Syntax**: `single | multiple`
   * 
   * **Initial value**: `single`
   * @deprecated
   */
  "-webkit-box-lines"?: BoxLines | undefined;
  /**
   * The **`box-ordinal-group`** CSS property assigns the flexbox's child elements to an ordinal group.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `1`
   * @deprecated
   */
  "-webkit-box-ordinal-group"?: BoxOrdinalGroup | undefined;
  /**
   * The **`box-orient`** CSS property sets whether an element lays out its contents horizontally or vertically.
   * 
   * **Syntax**: `horizontal | vertical | inline-axis | block-axis | inherit`
   * 
   * **Initial value**: `inline-axis` (`horizontal` in XUL)
   * @deprecated
   */
  "-webkit-box-orient"?: BoxOrient | undefined;
  /**
   * The **`-moz-box-pack`** and **`-webkit-box-pack`** CSS properties specify how a `-moz-box` or `-webkit-box` packs its contents in the direction of its layout. The effect of this is only visible if there is extra space in the box.
   * 
   * **Syntax**: `start | center | end | justify`
   * 
   * **Initial value**: `start`
   * @deprecated
   */
  "-webkit-box-pack"?: BoxPack | undefined;
  /**
   * The **`scroll-snap-points-x`** CSS property defines the horizontal positioning of snap points within the content of the scroll container they are applied to.
   * 
   * **Syntax**: `none | repeat( <length-percentage> )`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "-webkit-scroll-snap-points-x"?: ScrollSnapPointsX | undefined;
  /**
   * The **`scroll-snap-points-y`** CSS property defines the vertical positioning of snap points within the content of the scroll container they are applied to.
   * 
   * **Syntax**: `none | repeat( <length-percentage> )`
   * 
   * **Initial value**: `none`
   * @deprecated
   */
  "-webkit-scroll-snap-points-y"?: ScrollSnapPointsY | undefined;
}

export interface SvgPropertiesHyphen<TLength = (string & {}) | 0, TTime = string & {}> {
  "alignment-baseline"?: AlignmentBaseline | undefined;
  "baseline-shift"?: BaselineShift<TLength> | undefined;
  clip?: Clip | undefined;
  "clip-path"?: ClipPath | undefined;
  "clip-rule"?: ClipRule | undefined;
  color?: Color | undefined;
  "color-interpolation"?: ColorInterpolation | undefined;
  "color-rendering"?: ColorRendering | undefined;
  cursor?: Cursor | undefined;
  direction?: Direction | undefined;
  display?: Display | undefined;
  "dominant-baseline"?: DominantBaseline | undefined;
  fill?: Fill | undefined;
  "fill-opacity"?: FillOpacity | undefined;
  "fill-rule"?: FillRule | undefined;
  filter?: Filter | undefined;
  "flood-color"?: FloodColor | undefined;
  "flood-opacity"?: FloodOpacity | undefined;
  font?: Font | undefined;
  "font-family"?: FontFamily | undefined;
  "font-size"?: FontSize<TLength> | undefined;
  "font-size-adjust"?: FontSizeAdjust | undefined;
  "font-stretch"?: FontStretch | undefined;
  "font-style"?: FontStyle | undefined;
  "font-variant"?: FontVariant | undefined;
  "font-weight"?: FontWeight | undefined;
  "glyph-orientation-vertical"?: GlyphOrientationVertical | undefined;
  "image-rendering"?: ImageRendering | undefined;
  "letter-spacing"?: LetterSpacing<TLength> | undefined;
  "lighting-color"?: LightingColor | undefined;
  "line-height"?: LineHeight<TLength> | undefined;
  marker?: Marker | undefined;
  "marker-end"?: MarkerEnd | undefined;
  "marker-mid"?: MarkerMid | undefined;
  "marker-start"?: MarkerStart | undefined;
  mask?: Mask<TLength> | undefined;
  opacity?: Opacity | undefined;
  overflow?: Overflow | undefined;
  "paint-order"?: PaintOrder | undefined;
  "pointer-events"?: PointerEvents | undefined;
  "shape-rendering"?: ShapeRendering | undefined;
  "stop-color"?: StopColor | undefined;
  "stop-opacity"?: StopOpacity | undefined;
  stroke?: Stroke | undefined;
  "stroke-dasharray"?: StrokeDasharray<TLength> | undefined;
  "stroke-dashoffset"?: StrokeDashoffset<TLength> | undefined;
  "stroke-linecap"?: StrokeLinecap | undefined;
  "stroke-linejoin"?: StrokeLinejoin | undefined;
  "stroke-miterlimit"?: StrokeMiterlimit | undefined;
  "stroke-opacity"?: StrokeOpacity | undefined;
  "stroke-width"?: StrokeWidth<TLength> | undefined;
  "text-anchor"?: TextAnchor | undefined;
  "text-decoration"?: TextDecoration<TLength> | undefined;
  "text-rendering"?: TextRendering | undefined;
  "unicode-bidi"?: UnicodeBidi | undefined;
  "vector-effect"?: VectorEffect | undefined;
  visibility?: Visibility | undefined;
  "white-space"?: WhiteSpace | undefined;
  "word-spacing"?: WordSpacing<TLength> | undefined;
  "writing-mode"?: WritingMode | undefined;
}

export class ElementRef<T = any> {
  /**
   * The underlying native element or `null` if direct access to native elements is not supported
   * (e.g. when the application runs in a web worker).
   * 
   * <div class="callout is-critical">
   *   <header>Use with caution</header>
   *   <p>
   *    Use this API as the last resort when direct access to DOM is needed. Use templating and
   *    data-binding provided by Angular instead. Alternatively you can take a look at {@link * Renderer2}
   *    which provides API that can safely be used even when direct access to native elements is not
   *    supported.
   *   </p>
   *   <p>
   *    Relying on direct DOM access creates tight coupling between your application and rendering
   *    layers which will make it impossible to separate the two and deploy your application into a
   *    web worker.
   *   </p>
   * </div>
   */
  nativeElement: T;
  constructor(nativeElement: T);
}

export class ViewRef extends ChangeDetectorRef {
  /**
   * Destroys this view and all of the data structures associated with it.
   */
  destroy(): void;
  /**
   * Reports whether this view has been destroyed.
   * @returns True after the `destroy()` method has been called, false otherwise.
   */
  get destroyed(): boolean;
  /**
   * A lifecycle hook that provides additional developer-defined cleanup
   * functionality for views.
   * @param callback A handler function that cleans up developer-defined data
   * associated with a view. Called when the `destroy()` method is invoked.
   */
  onDestroy(callback: Function): any;
}

export class ChangeDetectorRef {
  /**
   * When a view uses the {@link ChangeDetectionStrategy#OnPush OnPush} (checkOnce)
   * change detection strategy, explicitly marks the view as changed so that
   * it can be checked again.
   * 
   * Components are normally marked as dirty (in need of rerendering) when inputs
   * have changed or events have fired in the view. Call this method to ensure that
   * a component is checked even if these triggers have not occurred.
   * 
   * <!-- TODO: Add a link to a chapter on OnPush components -->
   */
  markForCheck(): void;
  /**
   * Detaches this view from the change-detection tree.
   * A detached view is  not checked until it is reattached.
   * Use in combination with `detectChanges()` to implement local change detection checks.
   * 
   * Detached views are not checked during change detection runs until they are
   * re-attached, even if they are marked as dirty.
   * 
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
   */
  detach(): void;
  /**
   * Checks this view and its children. Use in combination with {@link ChangeDetectorRef#detach * detach}
   * to implement local change detection checks.
   * 
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
   */
  detectChanges(): void;
  /**
   * Checks the change detector and its children, and throws if any changes are detected.
   * 
   * Use in development mode to verify that running change detection doesn't introduce
   * other changes. Calling it in production mode is a noop.
   */
  checkNoChanges(): void;
  /**
   * Re-attaches the previously detached view to the change detection tree.
   * Views are attached to the tree by default.
   * 
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   */
  reattach(): void;
}

export interface StandardLonghandProperties<TLength = (string & {}) | 0, TTime = string & {}> {
  /**
   * The **`accent-color`** CSS property sets the accent color for user-interface controls generated by some elements.
   * 
   * **Syntax**: `auto | <color>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **93** | **92**  | **15.4** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/accent-color
   */
  accentColor?: AccentColor | undefined;
  /**
   * The CSS **`align-content`** property sets the distribution of space between and around content items along a flexbox's cross-axis or a grid's block axis.
   * 
   * **Syntax**: `normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position>`
   * 
   * **Initial value**: `normal`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **28**  |  **9**  | **12** | **11** |
   * | 21 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/align-content
   */
  alignContent?: AlignContent | undefined;
  /**
   * The CSS **`align-items`** property sets the `align-self` value on all direct children as a group. In Flexbox, it controls the alignment of items on the Cross Axis. In Grid Layout, it controls the alignment of items on the Block Axis within their grid area.
   * 
   * **Syntax**: `normal | stretch | <baseline-position> | [ <overflow-position>? <self-position> ]`
   * 
   * **Initial value**: `normal`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **20**  |  **9**  | **12** | **11** |
   * | 21 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/align-items
   */
  alignItems?: AlignItems | undefined;
  /**
   * The **`align-self`** CSS property overrides a grid or flex item's `align-items` value. In Grid, it aligns the item inside the grid area. In Flexbox, it aligns the item on the cross axis.
   * 
   * **Syntax**: `auto | normal | stretch | <baseline-position> | <overflow-position>? <self-position>`
   * 
   * **Initial value**: `auto`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **20**  |  **9**  | **12** | **10** |
   * | 21 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/align-self
   */
  alignSelf?: AlignSelf | undefined;
  /**
   * The **`align-tracks`** CSS property sets the alignment in the masonry axis for grid containers that have masonry in their block axis.
   * 
   * **Syntax**: `[ normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position> ]#`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   |   n/a   |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/align-tracks
   */
  alignTracks?: AlignTracks | undefined;
  /**
   * The **`animation-composition`** CSS property specifies the composite operation to use when multiple animations affect the same property simultaneously.
   * 
   * **Syntax**: `<single-animation-composition>#`
   * 
   * **Initial value**: `replace`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   |   n/a   |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-composition
   */
  animationComposition?: AnimationComposition | undefined;
  /**
   * The **`animation-delay`** CSS property specifies the amount of time to wait from applying the animation to an element before beginning to perform the animation. The animation can start later, immediately from its beginning, or immediately and partway through the animation.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-delay
   */
  animationDelay?: AnimationDelay<TTime> | undefined;
  /**
   * The **`animation-direction`** CSS property sets whether an animation should play forward, backward, or alternate back and forth between playing the sequence forward and backward.
   * 
   * **Syntax**: `<single-animation-direction>#`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-direction
   */
  animationDirection?: AnimationDirection | undefined;
  /**
   * The **`animation-duration`** CSS property sets the length of time that an animation takes to complete one cycle.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-duration
   */
  animationDuration?: AnimationDuration<TTime> | undefined;
  /**
   * The **`animation-fill-mode`** CSS property sets how a CSS animation applies styles to its target before and after its execution.
   * 
   * **Syntax**: `<single-animation-fill-mode>#`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 5 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-fill-mode
   */
  animationFillMode?: AnimationFillMode | undefined;
  /**
   * The **`animation-iteration-count`** CSS property sets the number of times an animation sequence should be played before stopping.
   * 
   * **Syntax**: `<single-animation-iteration-count>#`
   * 
   * **Initial value**: `1`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-iteration-count
   */
  animationIterationCount?: AnimationIterationCount | undefined;
  /**
   * The **`animation-name`** CSS property specifies the names of one or more `@keyframes` at-rules describing the animation or animations to apply to the element.
   * 
   * **Syntax**: `[ none | <keyframes-name> ]#`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-name
   */
  animationName?: AnimationName | undefined;
  /**
   * The **`animation-play-state`** CSS property sets whether an animation is running or paused.
   * 
   * **Syntax**: `<single-animation-play-state>#`
   * 
   * **Initial value**: `running`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-play-state
   */
  animationPlayState?: AnimationPlayState | undefined;
  /**
   * The **`animation-timeline`** CSS property specifies the names of one or more `@scroll-timeline` at-rules describing the scroll animations to apply to the element.
   * 
   * **Syntax**: `<single-animation-timeline>#`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   |   n/a   |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-timeline
   */
  animationTimeline?: AnimationTimeline | undefined;
  /**
   * The **`animation-timing-function`** CSS property sets how an animation progresses through the duration of each cycle.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-timing-function
   */
  animationTimingFunction?: AnimationTimingFunction | undefined;
  /**
   * The **`appearance`** CSS property is used to display an element using platform-native styling, based on the operating system's theme. The **`-moz-appearance`** and **`-webkit-appearance`** properties are non-standard versions of this property, used (respectively) by Gecko (Firefox) and by WebKit-based (e.g., Safari) and Blink-based (e.g., Chrome, Opera) browsers to achieve the same thing. Note that Firefox and Edge also support **`-webkit-appearance`**, for compatibility reasons.
   * 
   * **Syntax**: `none | auto | textfield | menulist-button | <compat-auto>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox |  Safari  |   Edge   | IE  |
   * | :-----: | :-----: | :------: | :------: | :-: |
   * | **84**  | **80**  | **15.4** |  **84**  | No  |
   * | 1 _-x-_ | 1 _-x-_ | 3 _-x-_  | 12 _-x-_ |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/appearance
   */
  appearance?: Appearance | undefined;
  /**
   * The **`aspect-ratio`** CSS property sets a **preferred aspect ratio** for the box, which will be used in the calculation of auto sizes and some other layout functions.
   * 
   * **Syntax**: `auto | <ratio>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **88** | **89**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/aspect-ratio
   */
  aspectRatio?: AspectRatio | undefined;
  /**
   * The **`backdrop-filter`** CSS property lets you apply graphical effects such as blurring or color shifting to the area behind an element. Because it applies to everything _behind_ the element, to see the effect you must make the element or its background at least partially transparent.
   * 
   * **Syntax**: `none | <filter-function-list>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |   Safari    |  Edge  | IE  |
   * | :----: | :-----: | :---------: | :----: | :-: |
   * | **76** | **103** | **9** _-x-_ | **17** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/backdrop-filter
   */
  backdropFilter?: BackdropFilter | undefined;
  /**
   * The **`backface-visibility`** CSS property sets whether the back face of an element is visible when turned towards the user.
   * 
   * **Syntax**: `visible | hidden`
   * 
   * **Initial value**: `visible`
   * 
   * |  Chrome  | Firefox  |  Safari   |  Edge  |   IE   |
   * | :------: | :------: | :-------: | :----: | :----: |
   * |  **36**  |  **16**  | **15.4**  | **12** | **10** |
   * | 12 _-x-_ | 10 _-x-_ | 5.1 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/backface-visibility
   */
  backfaceVisibility?: BackfaceVisibility | undefined;
  /**
   * The **`background-attachment`** CSS property sets whether a background image's position is fixed within the viewport, or scrolls with its containing block.
   * 
   * **Syntax**: `<attachment>#`
   * 
   * **Initial value**: `scroll`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-attachment
   */
  backgroundAttachment?: BackgroundAttachment | undefined;
  /**
   * The **`background-blend-mode`** CSS property sets how an element's background images should blend with each other and with the element's background color.
   * 
   * **Syntax**: `<blend-mode>#`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **35** | **30**  | **8**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-blend-mode
   */
  backgroundBlendMode?: BackgroundBlendMode | undefined;
  /**
   * The **`background-clip`** CSS property sets whether an element's background extends underneath its border box, padding box, or content box.
   * 
   * **Syntax**: `<box>#`
   * 
   * **Initial value**: `border-box`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **4**  | **14**  | **12** | **9** |
   * |        |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-clip
   */
  backgroundClip?: BackgroundClip | undefined;
  /**
   * The **`background-color`** CSS property sets the background color of an element.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `transparent`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-color
   */
  backgroundColor?: BackgroundColor | undefined;
  /**
   * The **`background-image`** CSS property sets one or more background images on an element.
   * 
   * **Syntax**: `<bg-image>#`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-image
   */
  backgroundImage?: BackgroundImage | undefined;
  /**
   * The **`background-origin`** CSS property sets the background's origin: from the border start, inside the border, or inside the padding.
   * 
   * **Syntax**: `<box>#`
   * 
   * **Initial value**: `padding-box`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **4**  | **3**  | **12** | **9** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-origin
   */
  backgroundOrigin?: BackgroundOrigin | undefined;
  /**
   * The **`background-position-x`** CSS property sets the initial horizontal position for each background image. The position is relative to the position layer set by `background-origin`.
   * 
   * **Syntax**: `[ center | [ [ left | right | x-start | x-end ]? <length-percentage>? ]! ]#`
   * 
   * **Initial value**: `0%`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  | **49**  | **1**  | **12** | **6** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-position-x
   */
  backgroundPositionX?: BackgroundPositionX<TLength> | undefined;
  /**
   * The **`background-position-y`** CSS property sets the initial vertical position for each background image. The position is relative to the position layer set by `background-origin`.
   * 
   * **Syntax**: `[ center | [ [ top | bottom | y-start | y-end ]? <length-percentage>? ]! ]#`
   * 
   * **Initial value**: `0%`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  | **49**  | **1**  | **12** | **6** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-position-y
   */
  backgroundPositionY?: BackgroundPositionY<TLength> | undefined;
  /**
   * The **`background-repeat`** CSS property sets how background images are repeated. A background image can be repeated along the horizontal and vertical axes, or not repeated at all.
   * 
   * **Syntax**: `<repeat-style>#`
   * 
   * **Initial value**: `repeat`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-repeat
   */
  backgroundRepeat?: BackgroundRepeat | undefined;
  /**
   * The **`background-size`** CSS property sets the size of the element's background image. The image can be left to its natural size, stretched, or constrained to fit the available space.
   * 
   * **Syntax**: `<bg-size>#`
   * 
   * **Initial value**: `auto auto`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * |  **3**  |  **4**  |  **5**  | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-size
   */
  backgroundSize?: BackgroundSize<TLength> | undefined;
  /**
   * **Syntax**: `clip | ellipsis | <string>`
   * 
   * **Initial value**: `clip`
   */
  blockOverflow?: BlockOverflow | undefined;
  /**
   * The **`block-size`** CSS property defines the horizontal or vertical size of an element's block, depending on its writing mode. It corresponds to either the `width` or the `height` property, depending on the value of `writing-mode`.
   * 
   * **Syntax**: `<'width'>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/block-size
   */
  blockSize?: BlockSize<TLength> | undefined;
  /**
   * The **`border-block-color`** CSS property defines the color of the logical block borders of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color` and `border-bottom-color`, or `border-right-color` and `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>{1,2}`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-color
   */
  borderBlockColor?: BorderBlockColor | undefined;
  /**
   * The **`border-block-end-color`** CSS property defines the color of the logical block-end border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-end-color
   */
  borderBlockEndColor?: BorderBlockEndColor | undefined;
  /**
   * The **`border-block-end-style`** CSS property defines the style of the logical block-end border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-end-style
   */
  borderBlockEndStyle?: BorderBlockEndStyle | undefined;
  /**
   * The **`border-block-end-width`** CSS property defines the width of the logical block-end border of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width`, `border-right-width`, `border-bottom-width`, or `border-left-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-end-width
   */
  borderBlockEndWidth?: BorderBlockEndWidth<TLength> | undefined;
  /**
   * The **`border-block-start-color`** CSS property defines the color of the logical block-start border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-start-color
   */
  borderBlockStartColor?: BorderBlockStartColor | undefined;
  /**
   * The **`border-block-start-style`** CSS property defines the style of the logical block start border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-start-style
   */
  borderBlockStartStyle?: BorderBlockStartStyle | undefined;
  /**
   * The **`border-block-start-width`** CSS property defines the width of the logical block-start border of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width`, `border-right-width`, `border-bottom-width`, or `border-left-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-start-width
   */
  borderBlockStartWidth?: BorderBlockStartWidth<TLength> | undefined;
  /**
   * The **`border-block-style`** CSS property defines the style of the logical block borders of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style` and `border-bottom-style`, or `border-left-style` and `border-right-style` properties depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-style
   */
  borderBlockStyle?: BorderBlockStyle | undefined;
  /**
   * The **`border-block-width`** CSS property defines the width of the logical block borders of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width` and `border-bottom-width`, or `border-left-width`, and `border-right-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-width
   */
  borderBlockWidth?: BorderBlockWidth<TLength> | undefined;
  /**
   * The **`border-bottom-color`** CSS property sets the color of an element's bottom border. It can also be set with the shorthand CSS properties `border-color` or `border-bottom`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-color
   */
  borderBottomColor?: BorderBottomColor | undefined;
  /**
   * The **`border-bottom-left-radius`** CSS property rounds the bottom-left corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * |  **4**  |  **4**  |  **5**  | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-left-radius
   */
  borderBottomLeftRadius?: BorderBottomLeftRadius<TLength> | undefined;
  /**
   * The **`border-bottom-right-radius`** CSS property rounds the bottom-right corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * |  **4**  |  **4**  |  **5**  | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-right-radius
   */
  borderBottomRightRadius?: BorderBottomRightRadius<TLength> | undefined;
  /**
   * The **`border-bottom-style`** CSS property sets the line style of an element's bottom `border`.
   * 
   * **Syntax**: `<line-style>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-style
   */
  borderBottomStyle?: BorderBottomStyle | undefined;
  /**
   * The **`border-bottom-width`** CSS property sets the width of the bottom border of an element.
   * 
   * **Syntax**: `<line-width>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-width
   */
  borderBottomWidth?: BorderBottomWidth<TLength> | undefined;
  /**
   * The **`border-collapse`** CSS property sets whether cells inside a `<table>` have shared or separate borders.
   * 
   * **Syntax**: `collapse | separate`
   * 
   * **Initial value**: `separate`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **1**  | **1.2** | **12** | **5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-collapse
   */
  borderCollapse?: BorderCollapse | undefined;
  /**
   * The **`border-end-end-radius`** CSS property defines a logical border radius on an element, which maps to a physical border radius that depends on the element's `writing-mode`, `direction`, and `text-orientation`. This is useful when building styles to work regardless of the text orientation and writing mode.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **89** | **66**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-end-end-radius
   */
  borderEndEndRadius?: BorderEndEndRadius<TLength> | undefined;
  /**
   * The **`border-end-start-radius`** CSS property defines a logical border radius on an element, which maps to a physical border radius depending on the element's `writing-mode`, `direction`, and `text-orientation`. This is useful when building styles to work regardless of the text orientation and writing mode.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **89** | **66**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-end-start-radius
   */
  borderEndStartRadius?: BorderEndStartRadius<TLength> | undefined;
  /**
   * The **`border-image-outset`** CSS property sets the distance by which an element's border image is set out from its border box.
   * 
   * **Syntax**: `[ <length> | <number> ]{1,4}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **15** | **15**  | **6**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-image-outset
   */
  borderImageOutset?: BorderImageOutset<TLength> | undefined;
  /**
   * The **`border-image-repeat`** CSS property defines how the edge regions of a source image are adjusted to fit the dimensions of an element's border image.
   * 
   * **Syntax**: `[ stretch | repeat | round | space ]{1,2}`
   * 
   * **Initial value**: `stretch`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **15** | **15**  | **6**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-image-repeat
   */
  borderImageRepeat?: BorderImageRepeat | undefined;
  /**
   * The **`border-image-slice`** CSS property divides the image specified by `border-image-source` into regions. These regions form the components of an element's border image.
   * 
   * **Syntax**: `<number-percentage>{1,4} && fill?`
   * 
   * **Initial value**: `100%`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **15** | **15**  | **6**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-image-slice
   */
  borderImageSlice?: BorderImageSlice | undefined;
  /**
   * The **`border-image-source`** CSS property sets the source image used to create an element's border image.
   * 
   * **Syntax**: `none | <image>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **15** | **15**  | **6**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-image-source
   */
  borderImageSource?: BorderImageSource | undefined;
  /**
   * The **`border-image-width`** CSS property sets the width of an element's border image.
   * 
   * **Syntax**: `[ <length-percentage> | <number> | auto ]{1,4}`
   * 
   * **Initial value**: `1`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **15** | **13**  | **6**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-image-width
   */
  borderImageWidth?: BorderImageWidth<TLength> | undefined;
  /**
   * The **`border-inline-color`** CSS property defines the color of the logical inline borders of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color` and `border-bottom-color`, or `border-right-color` and `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>{1,2}`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-color
   */
  borderInlineColor?: BorderInlineColor | undefined;
  /**
   * The **`border-inline-end-color`** CSS property defines the color of the logical inline-end border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome |           Firefox           |  Safari  | Edge | IE  |
   * | :----: | :-------------------------: | :------: | :--: | :-: |
   * | **69** |           **41**            | **12.1** | n/a  | No  |
   * |        | 3 _(-moz-border-end-color)_ |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end-color
   */
  borderInlineEndColor?: BorderInlineEndColor | undefined;
  /**
   * The **`border-inline-end-style`** CSS property defines the style of the logical inline end border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome |           Firefox           |  Safari  | Edge | IE  |
   * | :----: | :-------------------------: | :------: | :--: | :-: |
   * | **69** |           **41**            | **12.1** | n/a  | No  |
   * |        | 3 _(-moz-border-end-style)_ |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end-style
   */
  borderInlineEndStyle?: BorderInlineEndStyle | undefined;
  /**
   * The **`border-inline-end-width`** CSS property defines the width of the logical inline-end border of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width`, `border-right-width`, `border-bottom-width`, or `border-left-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome |           Firefox           |  Safari  | Edge | IE  |
   * | :----: | :-------------------------: | :------: | :--: | :-: |
   * | **69** |           **41**            | **12.1** | n/a  | No  |
   * |        | 3 _(-moz-border-end-width)_ |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end-width
   */
  borderInlineEndWidth?: BorderInlineEndWidth<TLength> | undefined;
  /**
   * The **`border-inline-start-color`** CSS property defines the color of the logical inline start border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome |            Firefox            |  Safari  | Edge | IE  |
   * | :----: | :---------------------------: | :------: | :--: | :-: |
   * | **69** |            **41**             | **12.1** | n/a  | No  |
   * |        | 3 _(-moz-border-start-color)_ |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-start-color
   */
  borderInlineStartColor?: BorderInlineStartColor | undefined;
  /**
   * The **`border-inline-start-style`** CSS property defines the style of the logical inline start border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome |            Firefox            |  Safari  | Edge | IE  |
   * | :----: | :---------------------------: | :------: | :--: | :-: |
   * | **69** |            **41**             | **12.1** | n/a  | No  |
   * |        | 3 _(-moz-border-start-style)_ |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-start-style
   */
  borderInlineStartStyle?: BorderInlineStartStyle | undefined;
  /**
   * The **`border-inline-start-width`** CSS property defines the width of the logical inline-start border of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width`, `border-right-width`, `border-bottom-width`, or `border-left-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-start-width
   */
  borderInlineStartWidth?: BorderInlineStartWidth<TLength> | undefined;
  /**
   * The **`border-inline-style`** CSS property defines the style of the logical inline borders of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style` and `border-bottom-style`, or `border-left-style` and `border-right-style` properties depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-style
   */
  borderInlineStyle?: BorderInlineStyle | undefined;
  /**
   * The **`border-inline-width`** CSS property defines the width of the logical inline borders of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width` and `border-bottom-width`, or `border-left-width`, and `border-right-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-width
   */
  borderInlineWidth?: BorderInlineWidth<TLength> | undefined;
  /**
   * The **`border-left-color`** CSS property sets the color of an element's left border. It can also be set with the shorthand CSS properties `border-color` or `border-left`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-left-color
   */
  borderLeftColor?: BorderLeftColor | undefined;
  /**
   * The **`border-left-style`** CSS property sets the line style of an element's left `border`.
   * 
   * **Syntax**: `<line-style>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-left-style
   */
  borderLeftStyle?: BorderLeftStyle | undefined;
  /**
   * The **`border-left-width`** CSS property sets the width of the left border of an element.
   * 
   * **Syntax**: `<line-width>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-left-width
   */
  borderLeftWidth?: BorderLeftWidth<TLength> | undefined;
  /**
   * The **`border-right-color`** CSS property sets the color of an element's right border. It can also be set with the shorthand CSS properties `border-color` or `border-right`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-right-color
   */
  borderRightColor?: BorderRightColor | undefined;
  /**
   * The **`border-right-style`** CSS property sets the line style of an element's right `border`.
   * 
   * **Syntax**: `<line-style>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-right-style
   */
  borderRightStyle?: BorderRightStyle | undefined;
  /**
   * The **`border-right-width`** CSS property sets the width of the right border of an element.
   * 
   * **Syntax**: `<line-width>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-right-width
   */
  borderRightWidth?: BorderRightWidth<TLength> | undefined;
  /**
   * The **`border-spacing`** CSS property sets the distance between the borders of adjacent `<table>` cells. This property applies only when `border-collapse` is `separate`.
   * 
   * **Syntax**: `<length> <length>?`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-spacing
   */
  borderSpacing?: BorderSpacing<TLength> | undefined;
  /**
   * The **`border-start-end-radius`** CSS property defines a logical border radius on an element, which maps to a physical border radius depending on the element's `writing-mode`, `direction`, and `text-orientation`. This is useful when building styles to work regardless of the text orientation and writing mode.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **89** | **66**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-start-end-radius
   */
  borderStartEndRadius?: BorderStartEndRadius<TLength> | undefined;
  /**
   * The **`border-start-start-radius`** CSS property defines a logical border radius on an element, which maps to a physical border radius that depends on the element's `writing-mode`, `direction`, and `text-orientation`. This is useful when building styles to work regardless of the text orientation and writing mode.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **89** | **66**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-start-start-radius
   */
  borderStartStartRadius?: BorderStartStartRadius<TLength> | undefined;
  /**
   * The **`border-top-color`** CSS property sets the color of an element's top border. It can also be set with the shorthand CSS properties `border-color` or `border-top`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-top-color
   */
  borderTopColor?: BorderTopColor | undefined;
  /**
   * The **`border-top-left-radius`** CSS property rounds the top-left corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * |  **4**  |  **4**  |  **5**  | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-top-left-radius
   */
  borderTopLeftRadius?: BorderTopLeftRadius<TLength> | undefined;
  /**
   * The **`border-top-right-radius`** CSS property rounds the top-right corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * |  **4**  |  **4**  |  **5**  | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-top-right-radius
   */
  borderTopRightRadius?: BorderTopRightRadius<TLength> | undefined;
  /**
   * The **`border-top-style`** CSS property sets the line style of an element's top `border`.
   * 
   * **Syntax**: `<line-style>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-top-style
   */
  borderTopStyle?: BorderTopStyle | undefined;
  /**
   * The **`border-top-width`** CSS property sets the width of the top border of an element.
   * 
   * **Syntax**: `<line-width>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-top-width
   */
  borderTopWidth?: BorderTopWidth<TLength> | undefined;
  /**
   * The **`bottom`** CSS property participates in setting the vertical position of a positioned element. It has no effect on non-positioned elements.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/bottom
   */
  bottom?: Bottom<TLength> | undefined;
  /**
   * The **`box-decoration-break`** CSS property specifies how an element's fragments should be rendered when broken across multiple lines, columns, or pages.
   * 
   * **Syntax**: `slice | clone`
   * 
   * **Initial value**: `slice`
   * 
   * |    Chrome    | Firefox |   Safari    | Edge | IE  |
   * | :----------: | :-----: | :---------: | :--: | :-: |
   * | **22** _-x-_ | **32**  | **7** _-x-_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/box-decoration-break
   */
  boxDecorationBreak?: BoxDecorationBreak | undefined;
  /**
   * The **`box-shadow`** CSS property adds shadow effects around an element's frame. You can set multiple effects separated by commas. A box shadow is described by X and Y offsets relative to the element, blur and spread radius, and color.
   * 
   * **Syntax**: `none | <shadow>#`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * | **10**  |  **4**  | **5.1** | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/box-shadow
   */
  boxShadow?: BoxShadow | undefined;
  /**
   * The **`box-sizing`** CSS property sets how the total width and height of an element is calculated.
   * 
   * **Syntax**: `content-box | border-box`
   * 
   * **Initial value**: `content-box`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * | **10**  | **29**  | **5.1** | **12** | **8** |
   * | 1 _-x-_ | 1 _-x-_ | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/box-sizing
   */
  boxSizing?: BoxSizing | undefined;
  /**
   * The **`break-after`** CSS property sets how page, column, or region breaks should behave after a generated box. If there is no generated box, the property is ignored.
   * 
   * **Syntax**: `auto | avoid | always | all | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **50** | **65**  | **10** | **12** | **10** |
   * @see https://developer.mozilla.org/docs/Web/CSS/break-after
   */
  breakAfter?: BreakAfter | undefined;
  /**
   * The **`break-before`** CSS property sets how page, column, or region breaks should behave before a generated box. If there is no generated box, the property is ignored.
   * 
   * **Syntax**: `auto | avoid | always | all | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **50** | **65**  | **10** | **12** | **10** |
   * @see https://developer.mozilla.org/docs/Web/CSS/break-before
   */
  breakBefore?: BreakBefore | undefined;
  /**
   * The **`break-inside`** CSS property sets how page, column, or region breaks should behave inside a generated box. If there is no generated box, the property is ignored.
   * 
   * **Syntax**: `auto | avoid | avoid-page | avoid-column | avoid-region`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **50** | **65**  | **10** | **12** | **10** |
   * @see https://developer.mozilla.org/docs/Web/CSS/break-inside
   */
  breakInside?: BreakInside | undefined;
  /**
   * The **`caption-side`** CSS property puts the content of a table's `<caption>` on the specified side. The values are relative to the `writing-mode` of the table.
   * 
   * **Syntax**: `top | bottom | block-start | block-end | inline-start | inline-end`
   * 
   * **Initial value**: `top`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/caption-side
   */
  captionSide?: CaptionSide | undefined;
  /**
   * The **`caret-color`** CSS property sets the color of the **insertion caret**, the visible marker where the next character typed will be inserted. This is sometimes referred to as the **text input cursor**. The caret appears in elements such as `<input>` or those with the `contenteditable` attribute. The caret is typically a thin vertical line that flashes to help make it more noticeable. By default, it is black, but its color can be altered with this property.
   * 
   * **Syntax**: `auto | <color>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **53**  | **11.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/caret-color
   */
  caretColor?: CaretColor | undefined;
  /**
   * The **`clear`** CSS property sets whether an element must be moved below (cleared) floating elements that precede it. The `clear` property applies to floating and non-floating elements.
   * 
   * **Syntax**: `none | left | right | both | inline-start | inline-end`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/clear
   */
  clear?: Clear | undefined;
  /**
   * The **`clip-path`** CSS property creates a clipping region that sets what part of an element should be shown. Parts that are inside the region are shown, while those outside are hidden.
   * 
   * **Syntax**: `<clip-source> | [ <basic-shape> || <geometry-box> ] | none`
   * 
   * **Initial value**: `none`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **55**  | **3.5** | **9.1** | **79** | **10** |
   * | 23 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/clip-path
   */
  clipPath?: ClipPath | undefined;
  /**
   * The **`color`** CSS property sets the foreground color value of an element's text and text decorations, and sets the `<currentcolor>` value. `currentcolor` may be used as an indirect value on _other_ properties and is the default for other color properties, such as `border-color`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `canvastext`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/color
   */
  color?: Color | undefined;
  /**
   * The **`print-color-adjust`** CSS property sets what, if anything, the user agent may do to optimize the appearance of the element on the output device. By default, the browser is allowed to make any adjustments to the element's appearance it determines to be necessary and prudent given the type and capabilities of the output device.
   * 
   * **Syntax**: `economy | exact`
   * 
   * **Initial value**: `economy`
   * 
   * |    Chrome    |       Firefox       |  Safari  |     Edge     | IE  |
   * | :----------: | :-----------------: | :------: | :----------: | :-: |
   * | **17** _-x-_ |       **97**        | **15.4** | **79** _-x-_ | No  |
   * |              | 48 _(color-adjust)_ | 6 _-x-_  |              |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/print-color-adjust
   */
  colorAdjust?: PrintColorAdjust | undefined;
  /**
   * The **`color-scheme`** CSS property allows an element to indicate which color schemes it can comfortably be rendered in.
   * 
   * **Syntax**: `normal | [ light | dark | <custom-ident> ]+ && only?`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **81** | **96**  | **13** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/color-scheme
   */
  colorScheme?: ColorScheme | undefined;
  /**
   * The **`column-count`** CSS property breaks an element's content into the specified number of columns.
   * 
   * **Syntax**: `<integer> | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **50**  | **52**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-count
   */
  columnCount?: ColumnCount | undefined;
  /**
   * The **`column-fill`** CSS property controls how an element's contents are balanced when broken into columns.
   * 
   * **Syntax**: `auto | balance | balance-all`
   * 
   * **Initial value**: `balance`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |   IE   |
   * | :----: | :-----: | :-----: | :----: | :----: |
   * | **50** | **52**  |  **9**  | **12** | **10** |
   * |        |         | 8 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-fill
   */
  columnFill?: ColumnFill | undefined;
  /**
   * The **`column-gap`** CSS property sets the size of the gap (gutter) between an element's columns.
   * 
   * **Syntax**: `normal | <length-percentage>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **1**  | **1.5** | **3**  | **12** | **10** |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-gap
   */
  columnGap?: ColumnGap<TLength> | undefined;
  /**
   * The **`column-rule-color`** CSS property sets the color of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **50**  | **52**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-rule-color
   */
  columnRuleColor?: ColumnRuleColor | undefined;
  /**
   * The **`column-rule-style`** CSS property sets the style of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'border-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **50**  | **52**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-rule-style
   */
  columnRuleStyle?: ColumnRuleStyle | undefined;
  /**
   * The **`column-rule-width`** CSS property sets the width of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'border-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **50**  | **52**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-rule-width
   */
  columnRuleWidth?: ColumnRuleWidth<TLength> | undefined;
  /**
   * The **`column-span`** CSS property makes it possible for an element to span across all columns when its value is set to `all`.
   * 
   * **Syntax**: `none | all`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
   * | :-----: | :-----: | :-------: | :----: | :----: |
   * | **50**  | **71**  |   **9**   | **12** | **10** |
   * | 6 _-x-_ |         | 5.1 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-span
   */
  columnSpan?: ColumnSpan | undefined;
  /**
   * The **`column-width`** CSS property sets the ideal column width in a multi-column layout. The container will have as many columns as can fit without any of them having a width less than the `column-width` value. If the width of the container is narrower than the specified value, the single column's width will be smaller than the declared column width.
   * 
   * **Syntax**: `<length> | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **50**  | **50**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-width
   */
  columnWidth?: ColumnWidth<TLength> | undefined;
  /**
   * The **`contain`** CSS property allows an author to indicate that an element and its contents are, as much as possible, _independent_ of the rest of the document tree. This allows the browser to recalculate layout, style, paint, size, or any combination of them for a limited area of the DOM and not the entire page, leading to obvious performance benefits.
   * 
   * **Syntax**: `none | strict | content | [ [ size || inline-size ] || layout || style || paint ]`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **52** | **69**  | **15.4** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/contain
   */
  contain?: Contain | undefined;
  /**
   * The **`content`** CSS property replaces an element with a generated value. Objects inserted using the `content` property are **anonymous replaced elements**.
   * 
   * **Syntax**: `normal | none | [ <content-replacement> | <content-list> ] [/ [ <string> | <counter> ]+ ]?`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/content
   */
  content?: Content | undefined;
  /**
   * The **`content-visibility`** CSS property controls whether or not an element renders its contents at all, along with forcing a strong set of containments, allowing user agents to potentially omit large swathes of layout and rendering work until it becomes needed. Basically it enables the user agent to skip an element's rendering work (including layout and painting) until it is needed — which makes the initial page load much faster.
   * 
   * **Syntax**: `visible | auto | hidden`
   * 
   * **Initial value**: `visible`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **85** |   No    |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/content-visibility
   */
  contentVisibility?: ContentVisibility | undefined;
  /**
   * The **`counter-increment`** CSS property increases or decreases the value of a CSS counter by a given value.
   * 
   * **Syntax**: `[ <counter-name> <integer>? ]+ | none`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **2**  |  **1**  | **3**  | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/counter-increment
   */
  counterIncrement?: CounterIncrement | undefined;
  /**
   * The **`counter-reset`** CSS property resets a CSS counter to a given value. This property will create a new counter or reversed counter with the given name on the specified element.
   * 
   * **Syntax**: `[ <counter-name> <integer>? | <reversed-counter-name> <integer>? ]+ | none`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **2**  |  **1**  | **3**  | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/counter-reset
   */
  counterReset?: CounterReset | undefined;
  /**
   * The **`counter-set`** CSS property sets a CSS counter to a given value. It manipulates the value of existing counters, and will only create new counters if there isn't already a counter of the given name on the element.
   * 
   * **Syntax**: `[ <counter-name> <integer>? ]+ | none`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **85** | **68**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/counter-set
   */
  counterSet?: CounterSet | undefined;
  /**
   * The **`cursor`** CSS property sets the mouse cursor, if any, to show when the mouse pointer is over an element.
   * 
   * **Syntax**: `[ [ <url> [ <x> <y> ]? , ]* [ auto | default | none | context-menu | help | pointer | progress | wait | cell | crosshair | text | vertical-text | alias | copy | move | no-drop | not-allowed | e-resize | n-resize | ne-resize | nw-resize | s-resize | se-resize | sw-resize | w-resize | ew-resize | ns-resize | nesw-resize | nwse-resize | col-resize | row-resize | all-scroll | zoom-in | zoom-out | grab | grabbing ] ]`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **1**  | **1.2** | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/cursor
   */
  cursor?: Cursor | undefined;
  /**
   * The **`direction`** CSS property sets the direction of text, table columns, and horizontal overflow. Use `rtl` for languages written from right to left (like Hebrew or Arabic), and `ltr` for those written from left to right (like English and most other languages).
   * 
   * **Syntax**: `ltr | rtl`
   * 
   * **Initial value**: `ltr`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **2**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/direction
   */
  direction?: Direction | undefined;
  /**
   * The **`display`** CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.
   * 
   * **Syntax**: `[ <display-outside> || <display-inside> ] | <display-listitem> | <display-internal> | <display-box> | <display-legacy>`
   * 
   * **Initial value**: `inline`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/display
   */
  display?: Display | undefined;
  /**
   * The **`empty-cells`** CSS property sets whether borders and backgrounds appear around `<table>` cells that have no visible content.
   * 
   * **Syntax**: `show | hide`
   * 
   * **Initial value**: `show`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **1**  | **1.2** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/empty-cells
   */
  emptyCells?: EmptyCells | undefined;
  /**
   * The **`filter`** CSS property applies graphical effects like blur or color shift to an element. Filters are commonly used to adjust the rendering of images, backgrounds, and borders.
   * 
   * **Syntax**: `none | <filter-function-list>`
   * 
   * **Initial value**: `none`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  | IE  |
   * | :------: | :-----: | :-----: | :----: | :-: |
   * |  **53**  | **35**  | **9.1** | **12** | No  |
   * | 18 _-x-_ |         | 6 _-x-_ |        |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/filter
   */
  filter?: Filter | undefined;
  /**
   * The **`flex-basis`** CSS property sets the initial main size of a flex item. It sets the size of the content box unless otherwise set with `box-sizing`.
   * 
   * **Syntax**: `content | <'width'>`
   * 
   * **Initial value**: `auto`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **22**  |  **9**  | **12** | **11** |
   * | 22 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-basis
   */
  flexBasis?: FlexBasis<TLength> | undefined;
  /**
   * The **`flex-direction`** CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).
   * 
   * **Syntax**: `row | row-reverse | column | column-reverse`
   * 
   * **Initial value**: `row`
   * 
   * |  Chrome  | Firefox  | Safari  |  Edge  |    IE    |
   * | :------: | :------: | :-----: | :----: | :------: |
   * |  **29**  |  **81**  |  **9**  | **12** |  **11**  |
   * | 21 _-x-_ | 49 _-x-_ | 7 _-x-_ |        | 10 _-x-_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-direction
   */
  flexDirection?: FlexDirection | undefined;
  /**
   * The **`flex-grow`** CSS property sets the flex grow factor of a flex item's main size.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |            IE            |
   * | :------: | :-----: | :-----: | :----: | :----------------------: |
   * |  **29**  | **20**  |  **9**  | **12** |          **11**          |
   * | 22 _-x-_ |         | 7 _-x-_ |        | 10 _(-ms-flex-positive)_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-grow
   */
  flexGrow?: FlexGrow | undefined;
  /**
   * The **`flex-shrink`** CSS property sets the flex shrink factor of a flex item. If the size of all flex items is larger than the flex container, items shrink to fit according to `flex-shrink`.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `1`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **20**  |  **9**  | **12** | **10** |
   * | 22 _-x-_ |         | 8 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-shrink
   */
  flexShrink?: FlexShrink | undefined;
  /**
   * The **`flex-wrap`** CSS property sets whether flex items are forced onto one line or can wrap onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked.
   * 
   * **Syntax**: `nowrap | wrap | wrap-reverse`
   * 
   * **Initial value**: `nowrap`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **28**  |  **9**  | **12** | **11** |
   * | 21 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-wrap
   */
  flexWrap?: FlexWrap | undefined;
  /**
   * The **`float`** CSS property places an element on the left or right side of its container, allowing text and inline elements to wrap around it. The element is removed from the normal flow of the page, though still remaining a part of the flow (in contrast to absolute positioning).
   * 
   * **Syntax**: `left | right | none | inline-start | inline-end`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/float
   */
  float?: Float | undefined;
  /**
   * The **`font-family`** CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.
   * 
   * **Syntax**: `[ <family-name> | <generic-family> ]#`
   * 
   * **Initial value**: depends on user agent
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-family
   */
  fontFamily?: FontFamily | undefined;
  /**
   * The **`font-feature-settings`** CSS property controls advanced typographic features in OpenType fonts.
   * 
   * **Syntax**: `normal | <feature-tag-value>#`
   * 
   * **Initial value**: `normal`
   * 
   * |  Chrome  | Firefox  | Safari  |  Edge  |   IE   |
   * | :------: | :------: | :-----: | :----: | :----: |
   * |  **48**  |  **34**  | **9.1** | **15** | **10** |
   * | 16 _-x-_ | 15 _-x-_ |         |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-feature-settings
   */
  fontFeatureSettings?: FontFeatureSettings | undefined;
  /**
   * The **`font-kerning`** CSS property sets the use of the kerning information stored in a font.
   * 
   * **Syntax**: `auto | normal | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * | **33** | **32**  |  **9**  | n/a  | No  |
   * |        |         | 6 _-x-_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-kerning
   */
  fontKerning?: FontKerning | undefined;
  /**
   * The **`font-language-override`** CSS property controls the use of language-specific glyphs in a typeface.
   * 
   * **Syntax**: `normal | <string>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **34**  |   No   | n/a  | No  |
   * |        | 4 _-x-_ |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-language-override
   */
  fontLanguageOverride?: FontLanguageOverride | undefined;
  /**
   * The **`font-optical-sizing`** CSS property sets whether text rendering is optimized for viewing at different sizes.
   * 
   * **Syntax**: `auto | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **79** | **62**  | **11** | **17** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-optical-sizing
   */
  fontOpticalSizing?: FontOpticalSizing | undefined;
  /**
   * The **`font-size`** CSS property sets the size of the font. Changing the font size also updates the sizes of the font size-relative `<length>` units, such as `em`, `ex`, and so forth.
   * 
   * **Syntax**: `<absolute-size> | <relative-size> | <length-percentage>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-size
   */
  fontSize?: FontSize<TLength> | undefined;
  /**
   * The **`font-size-adjust`** CSS property sets the size of lower-case letters relative to the current font size (which defines the size of upper-case letters).
   * 
   * **Syntax**: `none | [ ex-height | cap-height | ch-width | ic-width | ic-height ]? [ from-font | <number> ]`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   |  **3**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-size-adjust
   */
  fontSizeAdjust?: FontSizeAdjust | undefined;
  /**
   * The **`font-smooth`** CSS property controls the application of anti-aliasing when fonts are rendered.
   * 
   * **Syntax**: `auto | never | always | <absolute-size> | <length>`
   * 
   * **Initial value**: `auto`
   * 
   * |              Chrome              |              Firefox               |              Safari              | Edge | IE  |
   * | :------------------------------: | :--------------------------------: | :------------------------------: | :--: | :-: |
   * | **5** _(-webkit-font-smoothing)_ | **25** _(-moz-osx-font-smoothing)_ | **4** _(-webkit-font-smoothing)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-smooth
   */
  fontSmooth?: FontSmooth<TLength> | undefined;
  /**
   * The **`font-stretch`** CSS property selects a normal, condensed, or expanded face from a font.
   * 
   * **Syntax**: `<font-stretch-absolute>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **60** |  **9**  | **11** | **12** | **9** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-stretch
   */
  fontStretch?: FontStretch | undefined;
  /**
   * The **`font-style`** CSS property sets whether a font should be styled with a normal, italic, or oblique face from its `font-family`.
   * 
   * **Syntax**: `normal | italic | oblique <angle>?`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-style
   */
  fontStyle?: FontStyle | undefined;
  /**
   * The **`font-synthesis`** CSS property controls which missing typefaces, bold, italic, or small-caps, may be synthesized by the browser.
   * 
   * **Syntax**: `none | [ weight || style || small-caps ]`
   * 
   * **Initial value**: `weight style`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **97** | **34**  | **9**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-synthesis
   */
  fontSynthesis?: FontSynthesis | undefined;
  /**
   * The **`font-variant`** CSS shorthand property allows you to set all the font variants for a font.
   * 
   * **Syntax**: `normal | none | [ <common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> || stylistic( <feature-value-name> ) || historical-forms || styleset( <feature-value-name># ) || character-variant( <feature-value-name># ) || swash( <feature-value-name> ) || ornaments( <feature-value-name> ) || annotation( <feature-value-name> ) || [ small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps ] || <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero || <east-asian-variant-values> || <east-asian-width-values> || ruby ]`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant
   */
  fontVariant?: FontVariant | undefined;
  /**
   * The **`font-variant-alternates`** CSS property controls the usage of alternate glyphs. These alternate glyphs may be referenced by alternative names defined in `@font-feature-values`.
   * 
   * **Syntax**: `normal | [ stylistic( <feature-value-name> ) || historical-forms || styleset( <feature-value-name># ) || character-variant( <feature-value-name># ) || swash( <feature-value-name> ) || ornaments( <feature-value-name> ) || annotation( <feature-value-name> ) ]`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * |   No   | **34**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-alternates
   */
  fontVariantAlternates?: FontVariantAlternates | undefined;
  /**
   * The **`font-variant-caps`** CSS property controls the use of alternate glyphs for capital letters.
   * 
   * **Syntax**: `normal | small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * | **52** | **34**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-caps
   */
  fontVariantCaps?: FontVariantCaps | undefined;
  /**
   * The **`font-variant-east-asian`** CSS property controls the use of alternate glyphs for East Asian scripts, like Japanese and Chinese.
   * 
   * **Syntax**: `normal | [ <east-asian-variant-values> || <east-asian-width-values> || ruby ]`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * | **63** | **34**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-east-asian
   */
  fontVariantEastAsian?: FontVariantEastAsian | undefined;
  /**
   * The **`font-variant-ligatures`** CSS property controls which ligatures and contextual forms are used in textual content of the elements it applies to. This leads to more harmonized forms in the resulting text.
   * 
   * **Syntax**: `normal | none | [ <common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> ]`
   * 
   * **Initial value**: `normal`
   * 
   * |  Chrome  | Firefox | Safari  | Edge | IE  |
   * | :------: | :-----: | :-----: | :--: | :-: |
   * |  **34**  | **34**  | **9.1** | n/a  | No  |
   * | 31 _-x-_ |         | 7 _-x-_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-ligatures
   */
  fontVariantLigatures?: FontVariantLigatures | undefined;
  /**
   * The **`font-variant-numeric`** CSS property controls the usage of alternate glyphs for numbers, fractions, and ordinal markers.
   * 
   * **Syntax**: `normal | [ <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero ]`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * | **52** | **34**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric
   */
  fontVariantNumeric?: FontVariantNumeric | undefined;
  /**
   * The **`font-variant-position`** CSS property controls the use of alternate, smaller glyphs that are positioned as superscript or subscript.
   * 
   * **Syntax**: `normal | sub | super`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * |   No   | **34**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-position
   */
  fontVariantPosition?: FontVariantPosition | undefined;
  /**
   * The **`font-variation-settings`** CSS property provides low-level control over variable font characteristics, by specifying the four letter axis names of the characteristics you want to vary, along with their values.
   * 
   * **Syntax**: `normal | [ <string> <number> ]#`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **62** | **62**  | **11** | **17** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variation-settings
   */
  fontVariationSettings?: FontVariationSettings | undefined;
  /**
   * The **`font-weight`** CSS property sets the weight (or boldness) of the font. The weights available depend on the `font-family` that is currently set.
   * 
   * **Syntax**: `<font-weight-absolute> | bolder | lighter`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **2**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-weight
   */
  fontWeight?: FontWeight | undefined;
  /**
   * The **`forced-color-adjust`** CSS property allows authors to opt certain elements out of forced colors mode. This then restores the control of those values to CSS.
   * 
   * **Syntax**: `auto | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |              Edge               |                 IE                  |
   * | :----: | :-----: | :----: | :-----------------------------: | :---------------------------------: |
   * | **89** |   No    |   No   |             **79**              | **10** _(-ms-high-contrast-adjust)_ |
   * |        |         |        | 12 _(-ms-high-contrast-adjust)_ |                                     |
   * @see https://developer.mozilla.org/docs/Web/CSS/forced-color-adjust
   */
  forcedColorAdjust?: ForcedColorAdjust | undefined;
  /**
   * The **`grid-auto-columns`** CSS property specifies the size of an implicitly-created grid column track or pattern of tracks.
   * 
   * **Syntax**: `<track-size>+`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  |             IE              |
   * | :----: | :-----: | :------: | :----: | :-------------------------: |
   * | **57** | **70**  | **10.1** | **16** | **10** _(-ms-grid-columns)_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-columns
   */
  gridAutoColumns?: GridAutoColumns<TLength> | undefined;
  /**
   * The **`grid-auto-flow`** CSS property controls how the auto-placement algorithm works, specifying exactly how auto-placed items get flowed into the grid.
   * 
   * **Syntax**: `[ row | column ] || dense`
   * 
   * **Initial value**: `row`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-flow
   */
  gridAutoFlow?: GridAutoFlow | undefined;
  /**
   * The **`grid-auto-rows`** CSS property specifies the size of an implicitly-created grid row track or pattern of tracks.
   * 
   * **Syntax**: `<track-size>+`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  |            IE            |
   * | :----: | :-----: | :------: | :----: | :----------------------: |
   * | **57** | **70**  | **10.1** | **16** | **10** _(-ms-grid-rows)_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-rows
   */
  gridAutoRows?: GridAutoRows<TLength> | undefined;
  /**
   * The **`grid-column-end`** CSS property specifies a grid item's end position within the grid column by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the block-end edge of its grid area.
   * 
   * **Syntax**: `<grid-line>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-column-end
   */
  gridColumnEnd?: GridColumnEnd | undefined;
  /**
   * The **`grid-column-start`** CSS property specifies a grid item's start position within the grid column by contributing a line, a span, or nothing (automatic) to its grid placement. This start position defines the block-start edge of the grid area.
   * 
   * **Syntax**: `<grid-line>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-column-start
   */
  gridColumnStart?: GridColumnStart | undefined;
  /**
   * The **`grid-row-end`** CSS property specifies a grid item's end position within the grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-end edge of its grid area.
   * 
   * **Syntax**: `<grid-line>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-row-end
   */
  gridRowEnd?: GridRowEnd | undefined;
  /**
   * The **`grid-row-start`** CSS property specifies a grid item's start position within the grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start edge of its grid area.
   * 
   * **Syntax**: `<grid-line>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-row-start
   */
  gridRowStart?: GridRowStart | undefined;
  /**
   * The **`grid-template-areas`** CSS property specifies named grid areas, establishing the cells in the grid and assigning them names.
   * 
   * **Syntax**: `none | <string>+`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-areas
   */
  gridTemplateAreas?: GridTemplateAreas | undefined;
  /**
   * The **`grid-template-columns`** CSS property defines the line names and track sizing functions of the grid columns.
   * 
   * **Syntax**: `none | <track-list> | <auto-track-list> | subgrid <line-name-list>?`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  |             IE              |
   * | :----: | :-----: | :------: | :----: | :-------------------------: |
   * | **57** | **52**  | **10.1** | **16** | **10** _(-ms-grid-columns)_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-columns
   */
  gridTemplateColumns?: GridTemplateColumns<TLength> | undefined;
  /**
   * The **`grid-template-rows`** CSS property defines the line names and track sizing functions of the grid rows.
   * 
   * **Syntax**: `none | <track-list> | <auto-track-list> | subgrid <line-name-list>?`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  |            IE            |
   * | :----: | :-----: | :------: | :----: | :----------------------: |
   * | **57** | **52**  | **10.1** | **16** | **10** _(-ms-grid-rows)_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-rows
   */
  gridTemplateRows?: GridTemplateRows<TLength> | undefined;
  /**
   * The **`hanging-punctuation`** CSS property specifies whether a punctuation mark should hang at the start or end of a line of text. Hanging punctuation may be placed outside the line box.
   * 
   * **Syntax**: `none | [ first || [ force-end | allow-end ] || last ]`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   |   No    | **10** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/hanging-punctuation
   */
  hangingPunctuation?: HangingPunctuation | undefined;
  /**
   * The **`height`** CSS property specifies the height of an element. By default, the property defines the height of the content area. If `box-sizing` is set to `border-box`, however, it instead determines the height of the border area.
   * 
   * **Syntax**: `auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/height
   */
  height?: Height<TLength> | undefined;
  /**
   * The **`hyphenate-character`** CSS property sets the character (or string) used at the end of a line before a hyphenation break.
   * 
   * **Syntax**: `auto | <string>`
   * 
   * **Initial value**: `auto`
   * 
   * |   Chrome    | Firefox |    Safari     | Edge | IE  |
   * | :---------: | :-----: | :-----------: | :--: | :-: |
   * | **6** _-x-_ | **98**  | **5.1** _-x-_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/hyphenate-character
   */
  hyphenateCharacter?: HyphenateCharacter | undefined;
  /**
   * The **`hyphens`** CSS property specifies how words should be hyphenated when text wraps across multiple lines. It can prevent hyphenation entirely, hyphenate at manually-specified points within the text, or let the browser automatically insert hyphens where appropriate.
   * 
   * **Syntax**: `none | manual | auto`
   * 
   * **Initial value**: `manual`
   * 
   * |  Chrome  | Firefox |    Safari     |  Edge  |      IE      |
   * | :------: | :-----: | :-----------: | :----: | :----------: |
   * |  **55**  | **43**  | **5.1** _-x-_ | **79** | **10** _-x-_ |
   * | 13 _-x-_ | 6 _-x-_ |               |        |              |
   * @see https://developer.mozilla.org/docs/Web/CSS/hyphens
   */
  hyphens?: Hyphens | undefined;
  /**
   * The **`image-orientation`** CSS property specifies a layout-independent correction to the orientation of an image.
   * 
   * **Syntax**: `from-image | <angle> | [ <angle>? flip ]`
   * 
   * **Initial value**: `from-image`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **81** | **26**  | **13.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/image-orientation
   */
  imageOrientation?: ImageOrientation | undefined;
  /**
   * The **`image-rendering`** CSS property sets an image scaling algorithm. The property applies to an element itself, to any images set in its other properties, and to its descendants.
   * 
   * **Syntax**: `auto | crisp-edges | pixelated`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **13** | **3.6** | **6**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/image-rendering
   */
  imageRendering?: ImageRendering | undefined;
  /**
   * **Syntax**: `[ from-image || <resolution> ] && snap?`
   * 
   * **Initial value**: `1dppx`
   */
  imageResolution?: ImageResolution | undefined;
  /**
   * The `initial-letter` CSS property sets styling for dropped, raised, and sunken initial letters.
   * 
   * **Syntax**: `normal | [ <number> <integer>? ]`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox |   Safari    | Edge | IE  |
   * | :----: | :-----: | :---------: | :--: | :-: |
   * |   No   |   No    | **9** _-x-_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/initial-letter
   */
  initialLetter?: InitialLetter | undefined;
  /**
   * The **`inline-size`** CSS property defines the horizontal or vertical size of an element's block, depending on its writing mode. It corresponds to either the `width` or the `height` property, depending on the value of `writing-mode`.
   * 
   * **Syntax**: `<'width'>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inline-size
   */
  inlineSize?: InlineSize<TLength> | undefined;
  /**
   * **Syntax**: `auto | none`
   * 
   * **Initial value**: `auto`
   */
  inputSecurity?: InputSecurity | undefined;
  /**
   * The **`inset`** CSS property is a shorthand that corresponds to the `top`, `right`, `bottom`, and/or `left` properties. It has the same multi-value syntax of the `margin` shorthand.
   * 
   * **Syntax**: `<'top'>{1,4}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset
   */
  inset?: Inset<TLength> | undefined;
  /**
   * The **`inset-block`** CSS property defines the logical block start and end offsets of an element, which maps to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top` and `bottom`, or `right` and `left` properties depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>{1,2}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **63**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset-block
   */
  insetBlock?: InsetBlock<TLength> | undefined;
  /**
   * The **`inset-block-end`** CSS property defines the logical block end offset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **63**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset-block-end
   */
  insetBlockEnd?: InsetBlockEnd<TLength> | undefined;
  /**
   * The **`inset-block-start`** CSS property defines the logical block start offset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **63**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset-block-start
   */
  insetBlockStart?: InsetBlockStart<TLength> | undefined;
  /**
   * The **`inset-inline`** CSS property defines the logical start and end offsets of an element in the inline direction, which maps to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top` and `bottom`, or `right` and `left` properties depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>{1,2}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **63**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset-inline
   */
  insetInline?: InsetInline<TLength> | undefined;
  /**
   * The **`inset-inline-end`** CSS property defines the logical inline end inset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **63**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset-inline-end
   */
  insetInlineEnd?: InsetInlineEnd<TLength> | undefined;
  /**
   * The **`inset-inline-start`** CSS property defines the logical inline start inset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **63**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset-inline-start
   */
  insetInlineStart?: InsetInlineStart<TLength> | undefined;
  /**
   * The **`isolation`** CSS property determines whether an element must create a new stacking context.
   * 
   * **Syntax**: `auto | isolate`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **41** | **36**  | **8**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/isolation
   */
  isolation?: Isolation | undefined;
  /**
   * The CSS **`justify-content`** property defines how the browser distributes space between and around content items along the main-axis of a flex container, and the inline axis of a grid container.
   * 
   * **Syntax**: `normal | <content-distribution> | <overflow-position>? [ <content-position> | left | right ]`
   * 
   * **Initial value**: `normal`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **20**  |  **9**  | **12** | **11** |
   * | 21 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/justify-content
   */
  justifyContent?: JustifyContent | undefined;
  /**
   * The CSS **`justify-items`** property defines the default `justify-self` for all items of the box, giving them all a default way of justifying each box along the appropriate axis.
   * 
   * **Syntax**: `normal | stretch | <baseline-position> | <overflow-position>? [ <self-position> | left | right ] | legacy | legacy && [ left | right | center ]`
   * 
   * **Initial value**: `legacy`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **52** | **20**  | **9**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/justify-items
   */
  justifyItems?: JustifyItems | undefined;
  /**
   * The CSS **`justify-self`** property sets the way a box is justified inside its alignment container along the appropriate axis.
   * 
   * **Syntax**: `auto | normal | stretch | <baseline-position> | <overflow-position>? [ <self-position> | left | right ]`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  |   IE   |
   * | :----: | :-----: | :------: | :----: | :----: |
   * | **57** | **45**  | **10.1** | **16** | **10** |
   * @see https://developer.mozilla.org/docs/Web/CSS/justify-self
   */
  justifySelf?: JustifySelf | undefined;
  /**
   * The **`justify-tracks`** CSS property sets the alignment in the masonry axis for grid containers that have masonry in their inline axis.
   * 
   * **Syntax**: `[ normal | <content-distribution> | <overflow-position>? [ <content-position> | left | right ] ]#`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   |   n/a   |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/justify-tracks
   */
  justifyTracks?: JustifyTracks | undefined;
  /**
   * The **`left`** CSS property participates in specifying the horizontal position of a positioned element. It has no effect on non-positioned elements.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/left
   */
  left?: Left<TLength> | undefined;
  /**
   * The **`letter-spacing`** CSS property sets the horizontal spacing behavior between text characters. This value is added to the natural spacing between characters while rendering the text. Positive values of `letter-spacing` causes characters to spread farther apart, while negative values of `letter-spacing` bring characters closer together.
   * 
   * **Syntax**: `normal | <length>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/letter-spacing
   */
  letterSpacing?: LetterSpacing<TLength> | undefined;
  /**
   * The **`line-break`** CSS property sets how to break lines of Chinese, Japanese, or Korean (CJK) text when working with punctuation and symbols.
   * 
   * **Syntax**: `auto | loose | normal | strict | anywhere`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE    |
   * | :-----: | :-----: | :-----: | :----: | :-----: |
   * | **58**  | **69**  | **11**  | **14** | **5.5** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |         |
   * @see https://developer.mozilla.org/docs/Web/CSS/line-break
   */
  lineBreak?: LineBreak | undefined;
  /**
   * The **`line-height`** CSS property sets the height of a line box. It's commonly used to set the distance between lines of text. On block-level elements, it specifies the minimum height of line boxes within the element. On non-replaced inline elements, it specifies the height that is used to calculate line box height.
   * 
   * **Syntax**: `normal | <number> | <length> | <percentage>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/line-height
   */
  lineHeight?: LineHeight<TLength> | undefined;
  /**
   * The **`line-height-step`** CSS property sets the step unit for line box heights. When the property is set, line box heights are rounded up to the closest multiple of the unit.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |  n/a   |   No    |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/line-height-step
   */
  lineHeightStep?: LineHeightStep<TLength> | undefined;
  /**
   * The **`list-style-image`** CSS property sets an image to be used as the list item marker.
   * 
   * **Syntax**: `<image> | none`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/list-style-image
   */
  listStyleImage?: ListStyleImage | undefined;
  /**
   * The **`list-style-position`** CSS property sets the position of the `::marker` relative to a list item.
   * 
   * **Syntax**: `inside | outside`
   * 
   * **Initial value**: `outside`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/list-style-position
   */
  listStylePosition?: ListStylePosition | undefined;
  /**
   * The **`list-style-type`** CSS property sets the marker (such as a disc, character, or custom counter style) of a list item element.
   * 
   * **Syntax**: `<counter-style> | <string> | none`
   * 
   * **Initial value**: `disc`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/list-style-type
   */
  listStyleType?: ListStyleType | undefined;
  /**
   * The **`margin-block`** CSS shorthand property defines the logical block start and end margins of an element, which maps to physical margins depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'margin-left'>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-block
   */
  marginBlock?: MarginBlock<TLength> | undefined;
  /**
   * The **`margin-block-end`** CSS property defines the logical block end margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-block-end
   */
  marginBlockEnd?: MarginBlockEnd<TLength> | undefined;
  /**
   * The **`margin-block-start`** CSS property defines the logical block start margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-block-start
   */
  marginBlockStart?: MarginBlockStart<TLength> | undefined;
  /**
   * The **`margin-bottom`** CSS property sets the margin area on the bottom of an element. A positive value places it farther from its neighbors, while a negative value places it closer.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-bottom
   */
  marginBottom?: MarginBottom<TLength> | undefined;
  /**
   * The **`margin-inline`** CSS shorthand property is a shorthand property that defines both the logical inline start and end margins of an element, which maps to physical margins depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'margin-left'>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-inline
   */
  marginInline?: MarginInline<TLength> | undefined;
  /**
   * The **`margin-inline-end`** CSS property defines the logical inline end margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation. In other words, it corresponds to the `margin-top`, `margin-right`, `margin-bottom` or `margin-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   * 
   * |          Chrome          |        Firefox        |          Safari          | Edge | IE  |
   * | :----------------------: | :-------------------: | :----------------------: | :--: | :-: |
   * |          **87**          |        **41**         |         **12.1**         | n/a  | No  |
   * | 2 _(-webkit-margin-end)_ | 3 _(-moz-margin-end)_ | 3 _(-webkit-margin-end)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-inline-end
   */
  marginInlineEnd?: MarginInlineEnd<TLength> | undefined;
  /**
   * The **`margin-inline-start`** CSS property defines the logical inline start margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation. It corresponds to the `margin-top`, `margin-right`, `margin-bottom`, or `margin-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   * 
   * |           Chrome           |         Firefox         |           Safari           | Edge | IE  |
   * | :------------------------: | :---------------------: | :------------------------: | :--: | :-: |
   * |           **87**           |         **41**          |          **12.1**          | n/a  | No  |
   * | 2 _(-webkit-margin-start)_ | 3 _(-moz-margin-start)_ | 3 _(-webkit-margin-start)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-inline-start
   */
  marginInlineStart?: MarginInlineStart<TLength> | undefined;
  /**
   * The **`margin-left`** CSS property sets the margin area on the left side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-left
   */
  marginLeft?: MarginLeft<TLength> | undefined;
  /**
   * The **`margin-right`** CSS property sets the margin area on the right side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-right
   */
  marginRight?: MarginRight<TLength> | undefined;
  /**
   * The **`margin-top`** CSS property sets the margin area on the top of an element. A positive value places it farther from its neighbors, while a negative value places it closer.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-top
   */
  marginTop?: MarginTop<TLength> | undefined;
  /**
   * The **`mask-border-mode`** CSS property specifies the blending mode used in a mask border.
   * 
   * **Syntax**: `luminance | alpha`
   * 
   * **Initial value**: `alpha`
   */
  maskBorderMode?: MaskBorderMode | undefined;
  /**
   * The **`mask-border-outset`** CSS property specifies the distance by which an element's mask border is set out from its border box.
   * 
   * **Syntax**: `[ <length> | <number> ]{1,4}`
   * 
   * **Initial value**: `0`
   * 
   * |                 Chrome                  | Firefox |                  Safari                   | Edge | IE  |
   * | :-------------------------------------: | :-----: | :---------------------------------------: | :--: | :-: |
   * | **1** _(-webkit-mask-box-image-outset)_ |   No    | **3.1** _(-webkit-mask-box-image-outset)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-border-outset
   */
  maskBorderOutset?: MaskBorderOutset<TLength> | undefined;
  /**
   * The **`mask-border-repeat`** CSS property sets how the edge regions of a source image are adjusted to fit the dimensions of an element's mask border.
   * 
   * **Syntax**: `[ stretch | repeat | round | space ]{1,2}`
   * 
   * **Initial value**: `stretch`
   * 
   * |                 Chrome                  | Firefox |                  Safari                   | Edge | IE  |
   * | :-------------------------------------: | :-----: | :---------------------------------------: | :--: | :-: |
   * | **1** _(-webkit-mask-box-image-repeat)_ |   No    | **3.1** _(-webkit-mask-box-image-repeat)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-border-repeat
   */
  maskBorderRepeat?: MaskBorderRepeat | undefined;
  /**
   * The **`mask-border-slice`** CSS property divides the image set by `mask-border-source` into regions. These regions are used to form the components of an element's mask border.
   * 
   * **Syntax**: `<number-percentage>{1,4} fill?`
   * 
   * **Initial value**: `0`
   * 
   * |                 Chrome                 | Firefox |                  Safari                  | Edge | IE  |
   * | :------------------------------------: | :-----: | :--------------------------------------: | :--: | :-: |
   * | **1** _(-webkit-mask-box-image-slice)_ |   No    | **3.1** _(-webkit-mask-box-image-slice)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-border-slice
   */
  maskBorderSlice?: MaskBorderSlice | undefined;
  /**
   * The **`mask-border-source`** CSS property sets the source image used to create an element's mask border.
   * 
   * **Syntax**: `none | <image>`
   * 
   * **Initial value**: `none`
   * 
   * |                 Chrome                  | Firefox |                  Safari                   | Edge | IE  |
   * | :-------------------------------------: | :-----: | :---------------------------------------: | :--: | :-: |
   * | **1** _(-webkit-mask-box-image-source)_ |   No    | **3.1** _(-webkit-mask-box-image-source)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-border-source
   */
  maskBorderSource?: MaskBorderSource | undefined;
  /**
   * The **`mask-border-width`** CSS property sets the width of an element's mask border.
   * 
   * **Syntax**: `[ <length-percentage> | <number> | auto ]{1,4}`
   * 
   * **Initial value**: `auto`
   * 
   * |                 Chrome                 | Firefox |                  Safari                  | Edge | IE  |
   * | :------------------------------------: | :-----: | :--------------------------------------: | :--: | :-: |
   * | **1** _(-webkit-mask-box-image-width)_ |   No    | **3.1** _(-webkit-mask-box-image-width)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-border-width
   */
  maskBorderWidth?: MaskBorderWidth<TLength> | undefined;
  /**
   * The **`mask-clip`** CSS property determines the area which is affected by a mask. The painted content of an element must be restricted to this area.
   * 
   * **Syntax**: `[ <geometry-box> | no-clip ]#`
   * 
   * **Initial value**: `border-box`
   * 
   * |   Chrome    | Firefox |  Safari  | Edge | IE  |
   * | :---------: | :-----: | :------: | :--: | :-: |
   * | **1** _-x-_ | **53**  | **15.4** | n/a  | No  |
   * |             |         | 4 _-x-_  |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-clip
   */
  maskClip?: MaskClip | undefined;
  /**
   * The **`mask-composite`** CSS property represents a compositing operation used on the current mask layer with the mask layers below it.
   * 
   * **Syntax**: `<compositing-operator>#`
   * 
   * **Initial value**: `add`
   * 
   * | Chrome | Firefox |  Safari  | Edge  | IE  |
   * | :----: | :-----: | :------: | :---: | :-: |
   * |   No   | **53**  | **15.4** | 18-79 | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-composite
   */
  maskComposite?: MaskComposite | undefined;
  /**
   * The **`mask-image`** CSS property sets the image that is used as mask layer for an element. By default this means the alpha channel of the mask image will be multiplied with the alpha channel of the element. This can be controlled with the `mask-mode` property.
   * 
   * **Syntax**: `<mask-reference>#`
   * 
   * **Initial value**: `none`
   * 
   * |   Chrome    | Firefox |  Safari  | Edge  | IE  |
   * | :---------: | :-----: | :------: | :---: | :-: |
   * | **1** _-x-_ | **53**  | **15.4** | 16-79 | No  |
   * |             |         | 4 _-x-_  |       |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-image
   */
  maskImage?: MaskImage | undefined;
  /**
   * The **`mask-mode`** CSS property sets whether the mask reference defined by `mask-image` is treated as a luminance or alpha mask.
   * 
   * **Syntax**: `<masking-mode>#`
   * 
   * **Initial value**: `match-source`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * |   No   | **53**  | **15.4** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-mode
   */
  maskMode?: MaskMode | undefined;
  /**
   * The **`mask-origin`** CSS property sets the origin of a mask.
   * 
   * **Syntax**: `<geometry-box>#`
   * 
   * **Initial value**: `border-box`
   * 
   * |   Chrome    | Firefox |  Safari  | Edge | IE  |
   * | :---------: | :-----: | :------: | :--: | :-: |
   * | **1** _-x-_ | **53**  | **15.4** | n/a  | No  |
   * |             |         | 4 _-x-_  |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-origin
   */
  maskOrigin?: MaskOrigin | undefined;
  /**
   * The **`mask-position`** CSS property sets the initial position, relative to the mask position layer set by `mask-origin`, for each defined mask image.
   * 
   * **Syntax**: `<position>#`
   * 
   * **Initial value**: `center`
   * 
   * |   Chrome    | Firefox |  Safari   | Edge  | IE  |
   * | :---------: | :-----: | :-------: | :---: | :-: |
   * | **1** _-x-_ | **53**  | **15.4**  | 18-79 | No  |
   * |             |         | 3.1 _-x-_ |       |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-position
   */
  maskPosition?: MaskPosition<TLength> | undefined;
  /**
   * The **`mask-repeat`** CSS property sets how mask images are repeated. A mask image can be repeated along the horizontal axis, the vertical axis, both axes, or not repeated at all.
   * 
   * **Syntax**: `<repeat-style>#`
   * 
   * **Initial value**: `no-repeat`
   * 
   * |   Chrome    | Firefox |  Safari   | Edge  | IE  |
   * | :---------: | :-----: | :-------: | :---: | :-: |
   * | **1** _-x-_ | **53**  | **15.4**  | 18-79 | No  |
   * |             |         | 3.1 _-x-_ |       |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-repeat
   */
  maskRepeat?: MaskRepeat | undefined;
  /**
   * The **`mask-size`** CSS property specifies the sizes of the mask images. The size of the image can be fully or partially constrained in order to preserve its intrinsic ratio.
   * 
   * **Syntax**: `<bg-size>#`
   * 
   * **Initial value**: `auto`
   * 
   * |   Chrome    | Firefox |  Safari  | Edge  | IE  |
   * | :---------: | :-----: | :------: | :---: | :-: |
   * | **4** _-x-_ | **53**  | **15.4** | 18-79 | No  |
   * |             |         | 4 _-x-_  |       |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-size
   */
  maskSize?: MaskSize<TLength> | undefined;
  /**
   * The **`mask-type`** CSS property sets whether an SVG `<mask>` element is used as a _luminance_ or an _alpha_ mask. It applies to the `<mask>` element itself.
   * 
   * **Syntax**: `luminance | alpha`
   * 
   * **Initial value**: `luminance`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **24** | **35**  | **7**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-type
   */
  maskType?: MaskType | undefined;
  /**
   * The **`math-depth`** property describes a notion of _depth_ for each element of a mathematical formula, with respect to the top-level container of that formula. Concretely, this is used to determine the computed value of the font-size property when its specified value is `math`.
   * 
   * **Syntax**: `auto-add | add(<integer>) | <integer>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |  n/a   |   n/a   |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/math-depth
   */
  mathDepth?: MathDepth | undefined;
  /**
   * The `math-shift` property indicates whether superscripts inside MathML formulas should be raised by a normal or compact shift.
   * 
   * **Syntax**: `normal | compact`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |  n/a   |   No    |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/math-shift
   */
  mathShift?: MathShift | undefined;
  /**
   * The `math-style` property indicates whether MathML equations should render with normal or compact height.
   * 
   * **Syntax**: `normal | compact`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * |  n/a   |   n/a   | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/math-style
   */
  mathStyle?: MathStyle | undefined;
  /**
   * The **`max-block-size`** CSS property specifies the maximum size of an element in the direction opposite that of the writing direction as specified by `writing-mode`. That is, if the writing direction is horizontal, then `max-block-size` is equivalent to `max-height`; if the writing direction is vertical, `max-block-size` is the same as `max-width`.
   * 
   * **Syntax**: `<'max-width'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/max-block-size
   */
  maxBlockSize?: MaxBlockSize<TLength> | undefined;
  /**
   * The **`max-height`** CSS property sets the maximum height of an element. It prevents the used value of the `height` property from becoming larger than the value specified for `max-height`.
   * 
   * **Syntax**: `none | <length-percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **18** |  **1**  | **1.3** | **12** | **7** |
   * @see https://developer.mozilla.org/docs/Web/CSS/max-height
   */
  maxHeight?: MaxHeight<TLength> | undefined;
  /**
   * The **`max-inline-size`** CSS property defines the horizontal or vertical maximum size of an element's block, depending on its writing mode. It corresponds to either the `max-width` or the `max-height` property, depending on the value of `writing-mode`.
   * 
   * **Syntax**: `<'max-width'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |   Safari   | Edge | IE  |
   * | :----: | :-----: | :--------: | :--: | :-: |
   * | **57** | **41**  |  **12.1**  | n/a  | No  |
   * |        |         | 10.1 _-x-_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/max-inline-size
   */
  maxInlineSize?: MaxInlineSize<TLength> | undefined;
  /**
   * **Syntax**: `none | <integer>`
   * 
   * **Initial value**: `none`
   */
  maxLines?: MaxLines | undefined;
  /**
   * The **`max-width`** CSS property sets the maximum width of an element. It prevents the used value of the `width` property from becoming larger than the value specified by `max-width`.
   * 
   * **Syntax**: `none | <length-percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **7** |
   * @see https://developer.mozilla.org/docs/Web/CSS/max-width
   */
  maxWidth?: MaxWidth<TLength> | undefined;
  /**
   * The **`min-block-size`** CSS property defines the minimum horizontal or vertical size of an element's block, depending on its writing mode. It corresponds to either the `min-width` or the `min-height` property, depending on the value of `writing-mode`.
   * 
   * **Syntax**: `<'min-width'>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/min-block-size
   */
  minBlockSize?: MinBlockSize<TLength> | undefined;
  /**
   * The **`min-height`** CSS property sets the minimum height of an element. It prevents the used value of the `height` property from becoming smaller than the value specified for `min-height`.
   * 
   * **Syntax**: `auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **3**  | **1.3** | **12** | **7** |
   * @see https://developer.mozilla.org/docs/Web/CSS/min-height
   */
  minHeight?: MinHeight<TLength> | undefined;
  /**
   * The **`min-inline-size`** CSS property defines the horizontal or vertical minimal size of an element's block, depending on its writing mode. It corresponds to either the `min-width` or the `min-height` property, depending on the value of `writing-mode`.
   * 
   * **Syntax**: `<'min-width'>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/min-inline-size
   */
  minInlineSize?: MinInlineSize<TLength> | undefined;
  /**
   * The **`min-width`** CSS property sets the minimum width of an element. It prevents the used value of the `width` property from becoming smaller than the value specified for `min-width`.
   * 
   * **Syntax**: `auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **7** |
   * @see https://developer.mozilla.org/docs/Web/CSS/min-width
   */
  minWidth?: MinWidth<TLength> | undefined;
  /**
   * The **`mix-blend-mode`** CSS property sets how an element's content should blend with the content of the element's parent and the element's background.
   * 
   * **Syntax**: `<blend-mode> | plus-lighter`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **41** | **32**  | **8**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode
   */
  mixBlendMode?: MixBlendMode | undefined;
  /**
   * The **`offset-distance`** CSS property specifies a position along an `offset-path` for an element to be placed.
   * 
   * **Syntax**: `<length-percentage>`
   * 
   * **Initial value**: `0`
   * 
   * |         Chrome         | Firefox | Safari | Edge | IE  |
   * | :--------------------: | :-----: | :----: | :--: | :-: |
   * |         **55**         | **72**  |   No   | n/a  | No  |
   * | 46 _(motion-distance)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-distance
   */
  motionDistance?: OffsetDistance<TLength> | undefined;
  /**
   * The **`offset-path`** CSS property specifies a motion path for an element to follow and defines the element's positioning within the parent container or SVG coordinate system.
   * 
   * **Syntax**: `none | ray( [ <angle> && <size> && contain? ] ) | <path()> | <url> | [ <basic-shape> || <geometry-box> ]`
   * 
   * **Initial value**: `none`
   * 
   * |       Chrome       | Firefox |  Safari  | Edge | IE  |
   * | :----------------: | :-----: | :------: | :--: | :-: |
   * |       **55**       | **72**  | **15.4** | n/a  | No  |
   * | 46 _(motion-path)_ |         |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-path
   */
  motionPath?: OffsetPath | undefined;
  /**
   * The **`offset-rotate`** CSS property defines the orientation/direction of the element as it is positioned along the `offset-path`.
   * 
   * **Syntax**: `[ auto | reverse ] || <angle>`
   * 
   * **Initial value**: `auto`
   * 
   * |         Chrome         | Firefox | Safari | Edge | IE  |
   * | :--------------------: | :-----: | :----: | :--: | :-: |
   * |         **56**         | **72**  |   No   | n/a  | No  |
   * | 46 _(motion-rotation)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-rotate
   */
  motionRotation?: OffsetRotate | undefined;
  /**
   * The **`object-fit`** CSS property sets how the content of a replaced element, such as an `<img>` or `<video>`, should be resized to fit its container.
   * 
   * **Syntax**: `fill | contain | cover | none | scale-down`
   * 
   * **Initial value**: `fill`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **32** | **36**  | **10** | **79** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/object-fit
   */
  objectFit?: ObjectFit | undefined;
  /**
   * The **`object-position`** CSS property specifies the alignment of the selected replaced element's contents within the element's box. Areas of the box which aren't covered by the replaced element's object will show the element's background.
   * 
   * **Syntax**: `<position>`
   * 
   * **Initial value**: `50% 50%`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **32** | **36**  | **10** | **79** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/object-position
   */
  objectPosition?: ObjectPosition<TLength> | undefined;
  /**
   * **Syntax**: `auto | <position>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **72**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-anchor
   */
  offsetAnchor?: OffsetAnchor<TLength> | undefined;
  /**
   * The **`offset-distance`** CSS property specifies a position along an `offset-path` for an element to be placed.
   * 
   * **Syntax**: `<length-percentage>`
   * 
   * **Initial value**: `0`
   * 
   * |         Chrome         | Firefox | Safari | Edge | IE  |
   * | :--------------------: | :-----: | :----: | :--: | :-: |
   * |         **55**         | **72**  |   No   | n/a  | No  |
   * | 46 _(motion-distance)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-distance
   */
  offsetDistance?: OffsetDistance<TLength> | undefined;
  /**
   * The **`offset-path`** CSS property specifies a motion path for an element to follow and defines the element's positioning within the parent container or SVG coordinate system.
   * 
   * **Syntax**: `none | ray( [ <angle> && <size> && contain? ] ) | <path()> | <url> | [ <basic-shape> || <geometry-box> ]`
   * 
   * **Initial value**: `none`
   * 
   * |       Chrome       | Firefox |  Safari  | Edge | IE  |
   * | :----------------: | :-----: | :------: | :--: | :-: |
   * |       **55**       | **72**  | **15.4** | n/a  | No  |
   * | 46 _(motion-path)_ |         |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-path
   */
  offsetPath?: OffsetPath | undefined;
  /**
   * The **`offset-rotate`** CSS property defines the orientation/direction of the element as it is positioned along the `offset-path`.
   * 
   * **Syntax**: `[ auto | reverse ] || <angle>`
   * 
   * **Initial value**: `auto`
   * 
   * |         Chrome         | Firefox | Safari | Edge | IE  |
   * | :--------------------: | :-----: | :----: | :--: | :-: |
   * |         **56**         | **72**  |   No   | n/a  | No  |
   * | 46 _(motion-rotation)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-rotate
   */
  offsetRotate?: OffsetRotate | undefined;
  /**
   * The **`offset-rotate`** CSS property defines the orientation/direction of the element as it is positioned along the `offset-path`.
   * 
   * **Syntax**: `[ auto | reverse ] || <angle>`
   * 
   * **Initial value**: `auto`
   * 
   * |         Chrome         | Firefox | Safari | Edge | IE  |
   * | :--------------------: | :-----: | :----: | :--: | :-: |
   * |         **56**         | **72**  |   No   | n/a  | No  |
   * | 46 _(motion-rotation)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-rotate
   */
  offsetRotation?: OffsetRotate | undefined;
  /**
   * The **`opacity`** CSS property sets the opacity of an element. Opacity is the degree to which content behind an element is hidden, and is the opposite of transparency.
   * 
   * **Syntax**: `<alpha-value>`
   * 
   * **Initial value**: `1`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **2**  | **12** | **9** |
   * @see https://developer.mozilla.org/docs/Web/CSS/opacity
   */
  opacity?: Opacity | undefined;
  /**
   * The **`order`** CSS property sets the order to lay out an item in a flex or grid container. Items in a container are sorted by ascending `order` value and then by their source code order.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `0`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |    IE    |
   * | :------: | :-----: | :-----: | :----: | :------: |
   * |  **29**  | **20**  |  **9**  | **12** |  **11**  |
   * | 21 _-x-_ |         | 7 _-x-_ |        | 10 _-x-_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/order
   */
  order?: Order | undefined;
  /**
   * The **`orphans`** CSS property sets the minimum number of lines in a block container that must be shown at the _bottom_ of a page, region, or column.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `2`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **25** |   No    | **1.3** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/orphans
   */
  orphans?: Orphans | undefined;
  /**
   * The **`outline-color`** CSS property sets the color of an element's outline.
   * 
   * **Syntax**: `<color> | invert`
   * 
   * **Initial value**: `invert`, for browsers supporting it, `currentColor` for the other
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  | **1.5** | **1.2** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/outline-color
   */
  outlineColor?: OutlineColor | undefined;
  /**
   * The **`outline-offset`** CSS property sets the amount of space between an outline and the edge or border of an element.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari  |  Edge  | IE  |
   * | :----: | :-----: | :-----: | :----: | :-: |
   * | **1**  | **1.5** | **1.2** | **15** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/outline-offset
   */
  outlineOffset?: OutlineOffset<TLength> | undefined;
  /**
   * The **`outline-style`** CSS property sets the style of an element's outline. An outline is a line that is drawn around an element, outside the `border`.
   * 
   * **Syntax**: `auto | <'border-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  | **1.5** | **1.2** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/outline-style
   */
  outlineStyle?: OutlineStyle | undefined;
  /**
   * The CSS **`outline-width`** property sets the thickness of an element's outline. An outline is a line that is drawn around an element, outside the `border`.
   * 
   * **Syntax**: `<line-width>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  | **1.5** | **1.2** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/outline-width
   */
  outlineWidth?: OutlineWidth<TLength> | undefined;
  /**
   * **Syntax**: `auto | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **56** | **66**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-anchor
   */
  overflowAnchor?: OverflowAnchor | undefined;
  /**
   * **Syntax**: `visible | hidden | clip | scroll | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **69**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-block
   */
  overflowBlock?: OverflowBlock | undefined;
  /**
   * The **`overflow-clip-box`** CSS property specifies relative to which box the clipping happens when there is an overflow. It is short hand for the `overflow-clip-box-inline` and `overflow-clip-box-block` properties.
   * 
   * **Syntax**: `padding-box | content-box`
   * 
   * **Initial value**: `padding-box`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **29**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Mozilla/Gecko/Chrome/CSS/overflow-clip-box
   */
  overflowClipBox?: OverflowClipBox | undefined;
  /**
   * **Syntax**: `<visual-box> || <length [0,∞]>`
   * 
   * **Initial value**: `0px`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **90** |   No    |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-clip-margin
   */
  overflowClipMargin?: OverflowClipMargin<TLength> | undefined;
  /**
   * **Syntax**: `visible | hidden | clip | scroll | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **69**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-inline
   */
  overflowInline?: OverflowInline | undefined;
  /**
   * The **`overflow-wrap`** CSS property applies to inline elements, setting whether the browser should insert line breaks within an otherwise unbreakable string to prevent text from overflowing its line box.
   * 
   * **Syntax**: `normal | break-word | anywhere`
   * 
   * **Initial value**: `normal`
   * 
   * |     Chrome      |      Firefox      |     Safari      |       Edge       |          IE           |
   * | :-------------: | :---------------: | :-------------: | :--------------: | :-------------------: |
   * |     **23**      |      **49**       |      **7**      |      **18**      | **5.5** _(word-wrap)_ |
   * | 1 _(word-wrap)_ | 3.5 _(word-wrap)_ | 1 _(word-wrap)_ | 12 _(word-wrap)_ |                       |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-wrap
   */
  overflowWrap?: OverflowWrap | undefined;
  /**
   * The **`overflow-x`** CSS property sets what shows when content overflows a block-level element's left and right edges. This may be nothing, a scroll bar, or the overflow content.
   * 
   * **Syntax**: `visible | hidden | clip | scroll | auto`
   * 
   * **Initial value**: `visible`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  | **3.5** | **3**  | **12** | **5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-x
   */
  overflowX?: OverflowX | undefined;
  /**
   * The **`overflow-y`** CSS property sets what shows when content overflows a block-level element's top and bottom edges. This may be nothing, a scroll bar, or the overflow content.
   * 
   * **Syntax**: `visible | hidden | clip | scroll | auto`
   * 
   * **Initial value**: `visible`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  | **3.5** | **3**  | **12** | **5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-y
   */
  overflowY?: OverflowY | undefined;
  /**
   * The **`overscroll-behavior-block`** CSS property sets the browser's behavior when the block direction boundary of a scrolling area is reached.
   * 
   * **Syntax**: `contain | none | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **77** | **73**  | **16** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-block
   */
  overscrollBehaviorBlock?: OverscrollBehaviorBlock | undefined;
  /**
   * The **`overscroll-behavior-inline`** CSS property sets the browser's behavior when the inline direction boundary of a scrolling area is reached.
   * 
   * **Syntax**: `contain | none | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **77** | **73**  | **16** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-inline
   */
  overscrollBehaviorInline?: OverscrollBehaviorInline | undefined;
  /**
   * The **`overscroll-behavior-x`** CSS property sets the browser's behavior when the horizontal boundary of a scrolling area is reached.
   * 
   * **Syntax**: `contain | none | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **63** | **59**  | **16** | **18** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-x
   */
  overscrollBehaviorX?: OverscrollBehaviorX | undefined;
  /**
   * The **`overscroll-behavior-y`** CSS property sets the browser's behavior when the vertical boundary of a scrolling area is reached.
   * 
   * **Syntax**: `contain | none | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **63** | **59**  | **16** | **18** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-y
   */
  overscrollBehaviorY?: OverscrollBehaviorY | undefined;
  /**
   * The **`padding-block`** CSS shorthand property defines the logical block start and end padding of an element, which maps to physical padding properties depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-block
   */
  paddingBlock?: PaddingBlock<TLength> | undefined;
  /**
   * The **`padding-block-end`** CSS property defines the logical block end padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-block-end
   */
  paddingBlockEnd?: PaddingBlockEnd<TLength> | undefined;
  /**
   * The **`padding-block-start`** CSS property defines the logical block start padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-block-start
   */
  paddingBlockStart?: PaddingBlockStart<TLength> | undefined;
  /**
   * The **`padding-bottom`** CSS property sets the height of the padding area on the bottom of an element.
   * 
   * **Syntax**: `<length> | <percentage>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-bottom
   */
  paddingBottom?: PaddingBottom<TLength> | undefined;
  /**
   * The **`padding-inline`** CSS shorthand property defines the logical inline start and end padding of an element, which maps to physical padding properties depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-inline
   */
  paddingInline?: PaddingInline<TLength> | undefined;
  /**
   * The **`padding-inline-end`** CSS property defines the logical inline end padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   * 
   * |          Chrome           |        Firefox         |          Safari           | Edge | IE  |
   * | :-----------------------: | :--------------------: | :-----------------------: | :--: | :-: |
   * |          **87**           |         **41**         |         **12.1**          | n/a  | No  |
   * | 2 _(-webkit-padding-end)_ | 3 _(-moz-padding-end)_ | 3 _(-webkit-padding-end)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-inline-end
   */
  paddingInlineEnd?: PaddingInlineEnd<TLength> | undefined;
  /**
   * The **`padding-inline-start`** CSS property defines the logical inline start padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   * 
   * |           Chrome            |         Firefox          |           Safari            | Edge | IE  |
   * | :-------------------------: | :----------------------: | :-------------------------: | :--: | :-: |
   * |           **87**            |          **41**          |          **12.1**           | n/a  | No  |
   * | 2 _(-webkit-padding-start)_ | 3 _(-moz-padding-start)_ | 3 _(-webkit-padding-start)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-inline-start
   */
  paddingInlineStart?: PaddingInlineStart<TLength> | undefined;
  /**
   * The **`padding-left`** CSS property sets the width of the padding area to the left of an element.
   * 
   * **Syntax**: `<length> | <percentage>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-left
   */
  paddingLeft?: PaddingLeft<TLength> | undefined;
  /**
   * The **`padding-right`** CSS property sets the width of the padding area on the right of an element.
   * 
   * **Syntax**: `<length> | <percentage>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-right
   */
  paddingRight?: PaddingRight<TLength> | undefined;
  /**
   * The **`padding-top`** CSS property sets the height of the padding area on the top of an element.
   * 
   * **Syntax**: `<length> | <percentage>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-top
   */
  paddingTop?: PaddingTop<TLength> | undefined;
  /**
   * The **`page-break-after`** CSS property adjusts page breaks _after_ the current element.
   * 
   * **Syntax**: `auto | always | avoid | left | right | recto | verso`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **1**  | **1.2** | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/page-break-after
   */
  pageBreakAfter?: PageBreakAfter | undefined;
  /**
   * The **`page-break-before`** CSS property adjusts page breaks _before_ the current element.
   * 
   * **Syntax**: `auto | always | avoid | left | right | recto | verso`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **1**  | **1.2** | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/page-break-before
   */
  pageBreakBefore?: PageBreakBefore | undefined;
  /**
   * The **`page-break-inside`** CSS property adjusts page breaks _inside_ the current element.
   * 
   * **Syntax**: `auto | avoid`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  | **19**  | **1.3** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/page-break-inside
   */
  pageBreakInside?: PageBreakInside | undefined;
  /**
   * The **`paint-order`** CSS property lets you control the order in which the fill and stroke (and painting markers) of text content and shapes are drawn.
   * 
   * **Syntax**: `normal | [ fill || stroke || markers ]`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **35** | **60**  | **8**  | **17** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/paint-order
   */
  paintOrder?: PaintOrder | undefined;
  /**
   * The **`perspective`** CSS property determines the distance between the z=0 plane and the user in order to give a 3D-positioned element some perspective.
   * 
   * **Syntax**: `none | <length>`
   * 
   * **Initial value**: `none`
   * 
   * |  Chrome  | Firefox  | Safari  |  Edge  |   IE   |
   * | :------: | :------: | :-----: | :----: | :----: |
   * |  **36**  |  **16**  |  **9**  | **12** | **10** |
   * | 12 _-x-_ | 10 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/perspective
   */
  perspective?: Perspective<TLength> | undefined;
  /**
   * The **`perspective-origin`** CSS property determines the position at which the viewer is looking. It is used as the _vanishing point_ by the `perspective` property.
   * 
   * **Syntax**: `<position>`
   * 
   * **Initial value**: `50% 50%`
   * 
   * |  Chrome  | Firefox  | Safari  |  Edge  |   IE   |
   * | :------: | :------: | :-----: | :----: | :----: |
   * |  **36**  |  **16**  |  **9**  | **12** | **10** |
   * | 12 _-x-_ | 10 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/perspective-origin
   */
  perspectiveOrigin?: PerspectiveOrigin<TLength> | undefined;
  /**
   * The **`place-content`** CSS shorthand property allows you to align content along both the block and inline directions at once (i.e. the `align-content` and `justify-content` properties) in a relevant layout system such as Grid or Flexbox.
   * 
   * **Syntax**: `<'align-content'> <'justify-content'>?`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **59** | **45**  | **9**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/place-content
   */
  placeContent?: PlaceContent | undefined;
  /**
   * The **`pointer-events`** CSS property sets under what circumstances (if any) a particular graphic element can become the target of pointer events.
   * 
   * **Syntax**: `auto | none | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | inherit`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **1**  | **1.5** | **4**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/pointer-events
   */
  pointerEvents?: PointerEvents | undefined;
  /**
   * The **`position`** CSS property sets how an element is positioned in a document. The `top`, `right`, `bottom`, and `left` properties determine the final location of positioned elements.
   * 
   * **Syntax**: `static | relative | absolute | sticky | fixed`
   * 
   * **Initial value**: `static`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/position
   */
  position?: Position | undefined;
  /**
   * The **`print-color-adjust`** CSS property sets what, if anything, the user agent may do to optimize the appearance of the element on the output device. By default, the browser is allowed to make any adjustments to the element's appearance it determines to be necessary and prudent given the type and capabilities of the output device.
   * 
   * **Syntax**: `economy | exact`
   * 
   * **Initial value**: `economy`
   * 
   * |    Chrome    |       Firefox       |  Safari  |     Edge     | IE  |
   * | :----------: | :-----------------: | :------: | :----------: | :-: |
   * | **17** _-x-_ |       **97**        | **15.4** | **79** _-x-_ | No  |
   * |              | 48 _(color-adjust)_ | 6 _-x-_  |              |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/print-color-adjust
   */
  printColorAdjust?: PrintColorAdjust | undefined;
  /**
   * The **`quotes`** CSS property sets how the browser should render quotation marks that are added using the `open-quotes` or `close-quotes` values of the CSS `content` property.
   * 
   * **Syntax**: `none | auto | [ <string> <string> ]+`
   * 
   * **Initial value**: depends on user agent
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **11** | **1.5** | **9**  | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/quotes
   */
  quotes?: Quotes | undefined;
  /**
   * The **`resize`** CSS property sets whether an element is resizable, and if so, in which directions.
   * 
   * **Syntax**: `none | both | horizontal | vertical | block | inline`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **1**  |  **4**  | **3**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/resize
   */
  resize?: Resize | undefined;
  /**
   * The **`right`** CSS property participates in specifying the horizontal position of a positioned element. It has no effect on non-positioned elements.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/right
   */
  right?: Right<TLength> | undefined;
  /**
   * The **`rotate`** CSS property allows you to specify rotation transforms individually and independently of the `transform` property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the `transform` property.
   * 
   * **Syntax**: `none | <angle> | [ x | y | z | <number>{3} ] && <angle>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox |  Safari  | Edge | IE  |
   * | :-----: | :-----: | :------: | :--: | :-: |
   * | **104** | **72**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/rotate
   */
  rotate?: Rotate | undefined;
  /**
   * The **`row-gap`** CSS property sets the size of the gap (gutter) between an element's grid rows.
   * 
   * **Syntax**: `normal | <length-percentage>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **47** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/row-gap
   */
  rowGap?: RowGap<TLength> | undefined;
  /**
   * The **`ruby-align`** CSS property defines the distribution of the different ruby elements over the base.
   * 
   * **Syntax**: `start | center | space-between | space-around`
   * 
   * **Initial value**: `space-around`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **38**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/ruby-align
   */
  rubyAlign?: RubyAlign | undefined;
  /**
   * **Syntax**: `separate | collapse | auto`
   * 
   * **Initial value**: `separate`
   */
  rubyMerge?: RubyMerge | undefined;
  /**
   * The **`ruby-position`** CSS property defines the position of a ruby element relatives to its base element. It can be positioned over the element (`over`), under it (`under`), or between the characters on their right side (`inter-character`).
   * 
   * **Syntax**: `[ alternate || [ over | under ] ] | inter-character`
   * 
   * **Initial value**: `alternate`
   * 
   * | Chrome  | Firefox |   Safari    | Edge  | IE  |
   * | :-----: | :-----: | :---------: | :---: | :-: |
   * | **84**  | **38**  | **7** _-x-_ | 12-79 | No  |
   * | 1 _-x-_ |         |             |       |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/ruby-position
   */
  rubyPosition?: RubyPosition | undefined;
  /**
   * The **`scale`** CSS property allows you to specify scale transforms individually and independently of the `transform` property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the `transform` value.
   * 
   * **Syntax**: `none | <number>{1,3}`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox |  Safari  | Edge | IE  |
   * | :-----: | :-----: | :------: | :--: | :-: |
   * | **104** | **72**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scale
   */
  scale?: Scale | undefined;
  /**
   * The **`scroll-behavior`** CSS property sets the behavior for a scrolling box when scrolling is triggered by the navigation or CSSOM scrolling APIs.
   * 
   * **Syntax**: `auto | smooth`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **61** | **36**  | **15.4** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-behavior
   */
  scrollBehavior?: ScrollBehavior | undefined;
  /**
   * The **`scroll-margin`** shorthand property sets all of the scroll margins of an element at once, assigning values much like the `margin` property does for margins of an element.
   * 
   * **Syntax**: `<length>{1,4}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |          Safari           | Edge | IE  |
   * | :----: | :-----: | :-----------------------: | :--: | :-: |
   * | **69** | **90**  |         **14.1**          | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin
   */
  scrollMargin?: ScrollMargin<TLength> | undefined;
  /**
   * The `scroll-margin-block` shorthand property sets the scroll margins of an element in the block dimension.
   * 
   * **Syntax**: `<length>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-block
   */
  scrollMarginBlock?: ScrollMarginBlock<TLength> | undefined;
  /**
   * The `scroll-margin-block-end` property defines the margin of the scroll snap area at the end of the block dimension that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-block-end
   */
  scrollMarginBlockEnd?: ScrollMarginBlockEnd<TLength> | undefined;
  /**
   * The `scroll-margin-block-start` property defines the margin of the scroll snap area at the start of the block dimension that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-block-start
   */
  scrollMarginBlockStart?: ScrollMarginBlockStart<TLength> | undefined;
  /**
   * The `scroll-margin-bottom` property defines the bottom margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |              Safari              | Edge | IE  |
   * | :----: | :-----: | :------------------------------: | :--: | :-: |
   * | **69** | **68**  |             **14.1**             | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-bottom)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-bottom
   */
  scrollMarginBottom?: ScrollMarginBottom<TLength> | undefined;
  /**
   * The `scroll-margin-inline` shorthand property sets the scroll margins of an element in the inline dimension.
   * 
   * **Syntax**: `<length>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-inline
   */
  scrollMarginInline?: ScrollMarginInline<TLength> | undefined;
  /**
   * The `scroll-margin-inline-end` property defines the margin of the scroll snap area at the end of the inline dimension that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-inline-end
   */
  scrollMarginInlineEnd?: ScrollMarginInlineEnd<TLength> | undefined;
  /**
   * The `scroll-margin-inline-start` property defines the margin of the scroll snap area at the start of the inline dimension that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-inline-start
   */
  scrollMarginInlineStart?: ScrollMarginInlineStart<TLength> | undefined;
  /**
   * The `scroll-margin-left` property defines the left margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |             Safari             | Edge | IE  |
   * | :----: | :-----: | :----------------------------: | :--: | :-: |
   * | **69** | **68**  |            **14.1**            | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-left)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-left
   */
  scrollMarginLeft?: ScrollMarginLeft<TLength> | undefined;
  /**
   * The `scroll-margin-right` property defines the right margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |             Safari              | Edge | IE  |
   * | :----: | :-----: | :-----------------------------: | :--: | :-: |
   * | **69** | **68**  |            **14.1**             | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-right)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-right
   */
  scrollMarginRight?: ScrollMarginRight<TLength> | undefined;
  /**
   * The `scroll-margin-top` property defines the top margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |            Safari             | Edge | IE  |
   * | :----: | :-----: | :---------------------------: | :--: | :-: |
   * | **69** | **68**  |           **14.1**            | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-top)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-top
   */
  scrollMarginTop?: ScrollMarginTop<TLength> | undefined;
  /**
   * The **`scroll-padding`** shorthand property sets scroll padding on all sides of an element at once, much like the `padding` property does for padding on an element.
   * 
   * **Syntax**: `[ auto | <length-percentage> ]{1,4}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding
   */
  scrollPadding?: ScrollPadding<TLength> | undefined;
  /**
   * The `scroll-padding-block` shorthand property sets the scroll padding of an element in the block dimension.
   * 
   * **Syntax**: `[ auto | <length-percentage> ]{1,2}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-block
   */
  scrollPaddingBlock?: ScrollPaddingBlock<TLength> | undefined;
  /**
   * The `scroll-padding-block-end` property defines offsets for the end edge in the block dimension of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-block-end
   */
  scrollPaddingBlockEnd?: ScrollPaddingBlockEnd<TLength> | undefined;
  /**
   * The `scroll-padding-block-start` property defines offsets for the start edge in the block dimension of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-block-start
   */
  scrollPaddingBlockStart?: ScrollPaddingBlockStart<TLength> | undefined;
  /**
   * The `scroll-padding-bottom` property defines offsets for the bottom of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-bottom
   */
  scrollPaddingBottom?: ScrollPaddingBottom<TLength> | undefined;
  /**
   * The `scroll-padding-inline` shorthand property sets the scroll padding of an element in the inline dimension.
   * 
   * **Syntax**: `[ auto | <length-percentage> ]{1,2}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-inline
   */
  scrollPaddingInline?: ScrollPaddingInline<TLength> | undefined;
  /**
   * The `scroll-padding-inline-end` property defines offsets for the end edge in the inline dimension of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-inline-end
   */
  scrollPaddingInlineEnd?: ScrollPaddingInlineEnd<TLength> | undefined;
  /**
   * The `scroll-padding-inline-start` property defines offsets for the start edge in the inline dimension of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-inline-start
   */
  scrollPaddingInlineStart?: ScrollPaddingInlineStart<TLength> | undefined;
  /**
   * The `scroll-padding-left` property defines offsets for the left of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-left
   */
  scrollPaddingLeft?: ScrollPaddingLeft<TLength> | undefined;
  /**
   * The `scroll-padding-right` property defines offsets for the right of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-right
   */
  scrollPaddingRight?: ScrollPaddingRight<TLength> | undefined;
  /**
   * The **`scroll-padding-top`** property defines offsets for the top of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-top
   */
  scrollPaddingTop?: ScrollPaddingTop<TLength> | undefined;
  /**
   * The `scroll-snap-align` property specifies the box's snap position as an alignment of its snap area (as the alignment subject) within its snap container's snapport (as the alignment container). The two values specify the snapping alignment in the block axis and inline axis, respectively. If only one value is specified, the second value defaults to the same value.
   * 
   * **Syntax**: `[ none | start | end | center ]{1,2}`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **11** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-snap-align
   */
  scrollSnapAlign?: ScrollSnapAlign | undefined;
  /**
   * The **`scroll-margin`** shorthand property sets all of the scroll margins of an element at once, assigning values much like the `margin` property does for margins of an element.
   * 
   * **Syntax**: `<length>{1,4}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |          Safari           | Edge | IE  |
   * | :----: | :-----: | :-----------------------: | :--: | :-: |
   * | **69** |  68-90  |         **14.1**          | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin
   */
  scrollSnapMargin?: ScrollMargin<TLength> | undefined;
  /**
   * The `scroll-margin-bottom` property defines the bottom margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |              Safari              | Edge | IE  |
   * | :----: | :-----: | :------------------------------: | :--: | :-: |
   * | **69** | **68**  |             **14.1**             | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-bottom)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-bottom
   */
  scrollSnapMarginBottom?: ScrollMarginBottom<TLength> | undefined;
  /**
   * The `scroll-margin-left` property defines the left margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |             Safari             | Edge | IE  |
   * | :----: | :-----: | :----------------------------: | :--: | :-: |
   * | **69** | **68**  |            **14.1**            | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-left)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-left
   */
  scrollSnapMarginLeft?: ScrollMarginLeft<TLength> | undefined;
  /**
   * The `scroll-margin-right` property defines the right margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |             Safari              | Edge | IE  |
   * | :----: | :-----: | :-----------------------------: | :--: | :-: |
   * | **69** | **68**  |            **14.1**             | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-right)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-right
   */
  scrollSnapMarginRight?: ScrollMarginRight<TLength> | undefined;
  /**
   * The `scroll-margin-top` property defines the top margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |            Safari             | Edge | IE  |
   * | :----: | :-----: | :---------------------------: | :--: | :-: |
   * | **69** | **68**  |           **14.1**            | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-top)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-top
   */
  scrollSnapMarginTop?: ScrollMarginTop<TLength> | undefined;
  /**
   * The **`scroll-snap-stop`** CSS property defines whether the scroll container is allowed to "pass over" possible snap positions.
   * 
   * **Syntax**: `normal | always`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **75** | **103** | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-snap-stop
   */
  scrollSnapStop?: ScrollSnapStop | undefined;
  /**
   * The **`scroll-snap-type`** CSS property sets how strictly snap points are enforced on the scroll container in case there is one.
   * 
   * **Syntax**: `none | [ x | y | block | inline | both ] [ mandatory | proximity ]?`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |      IE      |
   * | :----: | :-----: | :-----: | :----: | :----------: |
   * | **69** |  39-68  | **11**  | **79** | **10** _-x-_ |
   * |        |         | 9 _-x-_ |        |              |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-snap-type
   */
  scrollSnapType?: ScrollSnapType | undefined;
  /**
   * The **`scrollbar-color`** CSS property sets the color of the scrollbar track and thumb.
   * 
   * **Syntax**: `auto | <color>{2}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **64**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scrollbar-color
   */
  scrollbarColor?: ScrollbarColor | undefined;
  /**
   * The **`scrollbar-gutter`** CSS property allows authors to reserve space for the scrollbar, preventing unwanted layout changes as the content grows while also avoiding unnecessary visuals when scrolling isn't needed.
   * 
   * **Syntax**: `auto | stable && both-edges?`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **94** | **97**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scrollbar-gutter
   */
  scrollbarGutter?: ScrollbarGutter | undefined;
  /**
   * The **`scrollbar-width`** property allows the author to set the maximum thickness of an element's scrollbars when they are shown.
   * 
   * **Syntax**: `auto | thin | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **64**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scrollbar-width
   */
  scrollbarWidth?: ScrollbarWidth | undefined;
  /**
   * The **`shape-image-threshold`** CSS property sets the alpha channel threshold used to extract the shape using an image as the value for `shape-outside`.
   * 
   * **Syntax**: `<alpha-value>`
   * 
   * **Initial value**: `0.0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **37** | **62**  | **10.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/shape-image-threshold
   */
  shapeImageThreshold?: ShapeImageThreshold | undefined;
  /**
   * The **`shape-margin`** CSS property sets a margin for a CSS shape created using `shape-outside`.
   * 
   * **Syntax**: `<length-percentage>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **37** | **62**  | **10.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/shape-margin
   */
  shapeMargin?: ShapeMargin<TLength> | undefined;
  /**
   * The **`shape-outside`** CSS property defines a shape—which may be non-rectangular—around which adjacent inline content should wrap. By default, inline content wraps around its margin box; `shape-outside` provides a way to customize this wrapping, making it possible to wrap text around complex objects rather than simple boxes.
   * 
   * **Syntax**: `none | [ <shape-box> || <basic-shape> ] | <image>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **37** | **62**  | **10.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/shape-outside
   */
  shapeOutside?: ShapeOutside | undefined;
  /**
   * The **`tab-size`** CSS property is used to customize the width of tab characters (U+0009).
   * 
   * **Syntax**: `<integer> | <length>`
   * 
   * **Initial value**: `8`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **21** | **91**  | **7**  | n/a  | No  |
   * |        | 4 _-x-_ |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/tab-size
   */
  tabSize?: TabSize<TLength> | undefined;
  /**
   * The **`table-layout`** CSS property sets the algorithm used to lay out `<table>` cells, rows, and columns.
   * 
   * **Syntax**: `auto | fixed`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **14** |  **1**  | **1**  | **12** | **5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/table-layout
   */
  tableLayout?: TableLayout | undefined;
  /**
   * The **`text-align`** CSS property sets the horizontal alignment of the content inside a block element or table-cell box. This means it works like `vertical-align` but in the horizontal direction.
   * 
   * **Syntax**: `start | end | left | right | center | justify | match-parent`
   * 
   * **Initial value**: `start`, or a nameless value that acts as `left` if _direction_ is `ltr`, `right` if _direction_ is `rtl` if `start` is not supported by the browser.
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-align
   */
  textAlign?: TextAlign | undefined;
  /**
   * The **`text-align-last`** CSS property sets how the last line of a block or a line, right before a forced line break, is aligned.
   * 
   * **Syntax**: `auto | start | end | left | right | center | justify`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **47** | **49**  | **16** | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-align-last
   */
  textAlignLast?: TextAlignLast | undefined;
  /**
   * The **`text-combine-upright`** CSS property sets the combination of characters into the space of a single character. If the combined text is wider than 1em, the user agent must fit the contents within 1em. The resulting composition is treated as a single upright glyph for layout and decoration. This property only has an effect in vertical writing modes.
   * 
   * **Syntax**: `none | all | [ digits <integer>? ]`
   * 
   * **Initial value**: `none`
   * 
   * |           Chrome           | Firefox |              Safari              | Edge  |                   IE                   |
   * | :------------------------: | :-----: | :------------------------------: | :---: | :------------------------------------: |
   * |           **48**           | **48**  | **5.1** _(-webkit-text-combine)_ | 15-79 | **11** _(-ms-text-combine-horizontal)_ |
   * | 9 _(-webkit-text-combine)_ |         |                                  |       |                                        |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-combine-upright
   */
  textCombineUpright?: TextCombineUpright | undefined;
  /**
   * The **`text-decoration-color`** CSS property sets the color of decorations added to text by `text-decoration-line`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **36**  | **12.1** | n/a  | No  |
   * |        |         | 8 _-x-_  |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-color
   */
  textDecorationColor?: TextDecorationColor | undefined;
  /**
   * The **`text-decoration-line`** CSS property sets the kind of decoration that is used on text in an element, such as an underline or overline.
   * 
   * **Syntax**: `none | [ underline || overline || line-through || blink ] | spelling-error | grammar-error`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **36**  | **12.1** | n/a  | No  |
   * |        |         | 8 _-x-_  |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-line
   */
  textDecorationLine?: TextDecorationLine | undefined;
  /**
   * The **`text-decoration-skip`** CSS property sets what parts of an element's content any text decoration affecting the element must skip over. It controls all text decoration lines drawn by the element and also any text decoration lines drawn by its ancestors.
   * 
   * **Syntax**: `none | [ objects || [ spaces | [ leading-spaces || trailing-spaces ] ] || edges || box-decoration ]`
   * 
   * **Initial value**: `objects`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | 57-64  |   No    | **12.1** | n/a  | No  |
   * |        |         | 7 _-x-_  |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-skip
   */
  textDecorationSkip?: TextDecorationSkip | undefined;
  /**
   * The **`text-decoration-skip-ink`** CSS property specifies how overlines and underlines are drawn when they pass over glyph ascenders and descenders.
   * 
   * **Syntax**: `auto | all | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **64** | **70**  | **15.4** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-skip-ink
   */
  textDecorationSkipInk?: TextDecorationSkipInk | undefined;
  /**
   * The **`text-decoration-style`** CSS property sets the style of the lines specified by `text-decoration-line`. The style applies to all lines that are set with `text-decoration-line`.
   * 
   * **Syntax**: `solid | double | dotted | dashed | wavy`
   * 
   * **Initial value**: `solid`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **36**  | **12.1** | n/a  | No  |
   * |        |         | 8 _-x-_  |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-style
   */
  textDecorationStyle?: TextDecorationStyle | undefined;
  /**
   * The **`text-decoration-thickness`** CSS property sets the stroke thickness of the decoration line that is used on text in an element, such as a line-through, underline, or overline.
   * 
   * **Syntax**: `auto | from-font | <length> | <percentage> `
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **89** | **70**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-thickness
   */
  textDecorationThickness?: TextDecorationThickness<TLength> | undefined;
  /**
   * The **`text-emphasis-color`** CSS property sets the color of emphasis marks. This value can also be set using the `text-emphasis` shorthand.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * |  Chrome  | Firefox | Safari | Edge | IE  |
   * | :------: | :-----: | :----: | :--: | :-: |
   * |  **99**  | **46**  | **7**  | n/a  | No  |
   * | 25 _-x-_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis-color
   */
  textEmphasisColor?: TextEmphasisColor | undefined;
  /**
   * The **`text-emphasis-position`** CSS property sets where emphasis marks are drawn. Like ruby text, if there isn't enough room for emphasis marks, the line height is increased.
   * 
   * **Syntax**: `[ over | under ] && [ right | left ]`
   * 
   * **Initial value**: `over right`
   * 
   * |  Chrome  | Firefox | Safari | Edge | IE  |
   * | :------: | :-----: | :----: | :--: | :-: |
   * |  **99**  | **46**  | **7**  | n/a  | No  |
   * | 25 _-x-_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis-position
   */
  textEmphasisPosition?: TextEmphasisPosition | undefined;
  /**
   * The **`text-emphasis-style`** CSS property sets the appearance of emphasis marks. It can also be set, and reset, using the `text-emphasis` shorthand.
   * 
   * **Syntax**: `none | [ [ filled | open ] || [ dot | circle | double-circle | triangle | sesame ] ] | <string>`
   * 
   * **Initial value**: `none`
   * 
   * |  Chrome  | Firefox | Safari | Edge | IE  |
   * | :------: | :-----: | :----: | :--: | :-: |
   * |  **99**  | **46**  | **7**  | n/a  | No  |
   * | 25 _-x-_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis-style
   */
  textEmphasisStyle?: TextEmphasisStyle | undefined;
  /**
   * The **`text-indent`** CSS property sets the length of empty space (indentation) that is put before lines of text in a block.
   * 
   * **Syntax**: `<length-percentage> && hanging? && each-line?`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-indent
   */
  textIndent?: TextIndent<TLength> | undefined;
  /**
   * The **`text-justify`** CSS property sets what type of justification should be applied to text when `text-align``: justify;` is set on an element.
   * 
   * **Syntax**: `auto | inter-character | inter-word | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * |  n/a   | **55**  |   No   | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-justify
   */
  textJustify?: TextJustify | undefined;
  /**
   * The **`text-orientation`** CSS property sets the orientation of the text characters in a line. It only affects text in vertical mode (when `writing-mode` is not `horizontal-tb`). It is useful for controlling the display of languages that use vertical script, and also for making vertical table headers.
   * 
   * **Syntax**: `mixed | upright | sideways`
   * 
   * **Initial value**: `mixed`
   * 
   * |  Chrome  | Firefox |  Safari   | Edge | IE  |
   * | :------: | :-----: | :-------: | :--: | :-: |
   * |  **48**  | **41**  |  **14**   | n/a  | No  |
   * | 11 _-x-_ |         | 5.1 _-x-_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-orientation
   */
  textOrientation?: TextOrientation | undefined;
  /**
   * The **`text-overflow`** CSS property sets how hidden overflow content is signaled to users. It can be clipped, display an ellipsis ('`…`'), or display a custom string.
   * 
   * **Syntax**: `[ clip | ellipsis | <string> ]{1,2}`
   * 
   * **Initial value**: `clip`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **7**  | **1.3** | **12** | **6** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-overflow
   */
  textOverflow?: TextOverflow | undefined;
  /**
   * The **`text-rendering`** CSS property provides information to the rendering engine about what to optimize for when rendering text.
   * 
   * **Syntax**: `auto | optimizeSpeed | optimizeLegibility | geometricPrecision`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **4**  |  **1**  | **5**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-rendering
   */
  textRendering?: TextRendering | undefined;
  /**
   * The **`text-shadow`** CSS property adds shadows to text. It accepts a comma-separated list of shadows to be applied to the text and any of its `decorations`. Each shadow is described by some combination of X and Y offsets from the element, blur radius, and color.
   * 
   * **Syntax**: `none | <shadow-t>#`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |   IE   |
   * | :----: | :-----: | :-----: | :----: | :----: |
   * | **2**  | **3.5** | **1.1** | **12** | **10** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-shadow
   */
  textShadow?: TextShadow | undefined;
  /**
   * The **`text-size-adjust`** CSS property controls the text inflation algorithm used on some smartphones and tablets. Other browsers will ignore this property.
   * 
   * **Syntax**: `none | auto | <percentage>`
   * 
   * **Initial value**: `auto` for smartphone browsers supporting inflation, `none` in other cases (and then not modifiable).
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **54** |   No    |   No   | **79** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-size-adjust
   */
  textSizeAdjust?: TextSizeAdjust | undefined;
  /**
   * The **`text-transform`** CSS property specifies how to capitalize an element's text. It can be used to make text appear in all-uppercase or all-lowercase, or with each word capitalized. It also can help improve legibility for ruby.
   * 
   * **Syntax**: `none | capitalize | uppercase | lowercase | full-width | full-size-kana`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-transform
   */
  textTransform?: TextTransform | undefined;
  /**
   * The **`text-underline-offset`** CSS property sets the offset distance of an underline text decoration line (applied using `text-decoration`) from its original position.
   * 
   * **Syntax**: `auto | <length> | <percentage> `
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **70**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-underline-offset
   */
  textUnderlineOffset?: TextUnderlineOffset<TLength> | undefined;
  /**
   * The **`text-underline-position`** CSS property specifies the position of the underline which is set using the `text-decoration` property's `underline` value.
   * 
   * **Syntax**: `auto | from-font | [ under || [ left | right ] ]`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :------: | :----: | :---: |
   * | **33** | **74**  | **12.1** | **12** | **6** |
   * |        |         | 9 _-x-_  |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-underline-position
   */
  textUnderlinePosition?: TextUnderlinePosition | undefined;
  /**
   * The **`top`** CSS property participates in specifying the vertical position of a positioned element. It has no effect on non-positioned elements.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/top
   */
  top?: Top<TLength> | undefined;
  /**
   * The **`touch-action`** CSS property sets how an element's region can be manipulated by a touchscreen user (for example, by zooming features built into the browser).
   * 
   * **Syntax**: `auto | none | [ [ pan-x | pan-left | pan-right ] || [ pan-y | pan-up | pan-down ] || pinch-zoom ] | manipulation`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |    IE    |
   * | :----: | :-----: | :----: | :----: | :------: |
   * | **36** | **52**  | **13** | **12** |  **11**  |
   * |        |         |        |        | 10 _-x-_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/touch-action
   */
  touchAction?: TouchAction | undefined;
  /**
   * The **`transform`** CSS property lets you rotate, scale, skew, or translate an element. It modifies the coordinate space of the CSS visual formatting model.
   * 
   * **Syntax**: `none | <transform-list>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |   IE    |
   * | :-----: | :-----: | :-------: | :----: | :-----: |
   * | **36**  | **16**  |   **9**   | **12** | **10**  |
   * | 1 _-x-_ |         | 3.1 _-x-_ |        | 9 _-x-_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/transform
   */
  transform?: Transform | undefined;
  /**
   * The **`transform-box`** CSS property defines the layout box to which the `transform` and `transform-origin` properties relate.
   * 
   * **Syntax**: `content-box | border-box | fill-box | stroke-box | view-box`
   * 
   * **Initial value**: `view-box`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **64** | **55**  | **11** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/transform-box
   */
  transformBox?: TransformBox | undefined;
  /**
   * The **`transform-origin`** CSS property sets the origin for an element's transformations.
   * 
   * **Syntax**: `[ <length-percentage> | left | center | right | top | bottom ] | [ [ <length-percentage> | left | center | right ] && [ <length-percentage> | top | center | bottom ] ] <length>?`
   * 
   * **Initial value**: `50% 50% 0`
   * 
   * | Chrome  |  Firefox  | Safari  |  Edge  |   IE    |
   * | :-----: | :-------: | :-----: | :----: | :-----: |
   * | **36**  |  **16**   |  **9**  | **12** | **10**  |
   * | 1 _-x-_ | 3.5 _-x-_ | 2 _-x-_ |        | 9 _-x-_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/transform-origin
   */
  transformOrigin?: TransformOrigin<TLength> | undefined;
  /**
   * The **`transform-style`** CSS property sets whether children of an element are positioned in the 3D space or are flattened in the plane of the element.
   * 
   * **Syntax**: `flat | preserve-3d`
   * 
   * **Initial value**: `flat`
   * 
   * |  Chrome  | Firefox  | Safari  |  Edge  | IE  |
   * | :------: | :------: | :-----: | :----: | :-: |
   * |  **36**  |  **16**  |  **9**  | **12** | No  |
   * | 12 _-x-_ | 10 _-x-_ | 4 _-x-_ |        |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/transform-style
   */
  transformStyle?: TransformStyle | undefined;
  /**
   * The **`transition-delay`** CSS property specifies the duration to wait before starting a property's transition effect when its value changes.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **26**  | **16**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ | 4 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/transition-delay
   */
  transitionDelay?: TransitionDelay<TTime> | undefined;
  /**
   * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
   * | :-----: | :-----: | :-------: | :----: | :----: |
   * | **26**  | **16**  |   **9**   | **12** | **10** |
   * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/transition-duration
   */
  transitionDuration?: TransitionDuration<TTime> | undefined;
  /**
   * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
   * 
   * **Syntax**: `none | <single-transition-property>#`
   * 
   * **Initial value**: all
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
   * | :-----: | :-----: | :-------: | :----: | :----: |
   * | **26**  | **16**  |   **9**   | **12** | **10** |
   * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/transition-property
   */
  transitionProperty?: TransitionProperty | undefined;
  /**
   * The **`transition-timing-function`** CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
   * | :-----: | :-----: | :-------: | :----: | :----: |
   * | **26**  | **16**  |   **9**   | **12** | **10** |
   * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/transition-timing-function
   */
  transitionTimingFunction?: TransitionTimingFunction | undefined;
  /**
   * The **`translate`** CSS property allows you to specify translation transforms individually and independently of the `transform` property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the `transform` value.
   * 
   * **Syntax**: `none | <length-percentage> [ <length-percentage> <length>? ]?`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox |  Safari  | Edge | IE  |
   * | :-----: | :-----: | :------: | :--: | :-: |
   * | **104** | **72**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/translate
   */
  translate?: Translate<TLength> | undefined;
  /**
   * The **`unicode-bidi`** CSS property, together with the `direction` property, determines how bidirectional text in a document is handled. For example, if a block of content contains both left-to-right and right-to-left text, the user-agent uses a complex Unicode algorithm to decide how to display the text. The `unicode-bidi` property overrides this algorithm and allows the developer to control the text embedding.
   * 
   * **Syntax**: `normal | embed | isolate | bidi-override | isolate-override | plaintext`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |   IE    |
   * | :----: | :-----: | :-----: | :----: | :-----: |
   * | **2**  |  **1**  | **1.3** | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/unicode-bidi
   */
  unicodeBidi?: UnicodeBidi | undefined;
  /**
   * The **`user-select`** CSS property controls whether the user can select text. This doesn't have any effect on content loaded as part of a browser's user interface (its chrome), except in textboxes.
   * 
   * **Syntax**: `auto | text | none | contain | all`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome  | Firefox |   Safari    |   Edge   |      IE      |
   * | :-----: | :-----: | :---------: | :------: | :----------: |
   * | **54**  | **69**  | **3** _-x-_ |  **79**  | **10** _-x-_ |
   * | 1 _-x-_ | 1 _-x-_ |             | 12 _-x-_ |              |
   * @see https://developer.mozilla.org/docs/Web/CSS/user-select
   */
  userSelect?: UserSelect | undefined;
  /**
   * The **`vertical-align`** CSS property sets vertical alignment of an inline, inline-block or table-cell box.
   * 
   * **Syntax**: `baseline | sub | super | text-top | text-bottom | middle | top | bottom | <percentage> | <length>`
   * 
   * **Initial value**: `baseline`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/vertical-align
   */
  verticalAlign?: VerticalAlign<TLength> | undefined;
  /**
   * The **`visibility`** CSS property shows or hides an element without changing the layout of a document. The property can also hide rows or columns in a `<table>`.
   * 
   * **Syntax**: `visible | hidden | collapse`
   * 
   * **Initial value**: `visible`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/visibility
   */
  visibility?: Visibility | undefined;
  /**
   * The **`white-space`** CSS property sets how white space inside an element is handled.
   * 
   * **Syntax**: `normal | pre | nowrap | pre-wrap | pre-line | break-spaces`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/white-space
   */
  whiteSpace?: WhiteSpace | undefined;
  /**
   * The **`widows`** CSS property sets the minimum number of lines in a block container that must be shown at the _top_ of a page, region, or column.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `2`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **25** |   No    | **1.3** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/widows
   */
  widows?: Widows | undefined;
  /**
   * The **`width`** CSS property sets an element's width. By default, it sets the width of the content area, but if `box-sizing` is set to `border-box`, it sets the width of the border area.
   * 
   * **Syntax**: `auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/width
   */
  width?: Width<TLength> | undefined;
  /**
   * The **`will-change`** CSS property hints to browsers how an element is expected to change. Browsers may set up optimizations before an element is actually changed. These kinds of optimizations can increase the responsiveness of a page by doing potentially expensive work before they are actually required.
   * 
   * **Syntax**: `auto | <animateable-feature>#`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * | **36** | **36**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/will-change
   */
  willChange?: WillChange | undefined;
  /**
   * The **`word-break`** CSS property sets whether line breaks appear wherever the text would otherwise overflow its content box.
   * 
   * **Syntax**: `normal | break-all | keep-all | break-word`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  | **15**  | **3**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/word-break
   */
  wordBreak?: WordBreak | undefined;
  /**
   * The **`word-spacing`** CSS property sets the length of space between words and between tags.
   * 
   * **Syntax**: `normal | <length>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **6** |
   * @see https://developer.mozilla.org/docs/Web/CSS/word-spacing
   */
  wordSpacing?: WordSpacing<TLength> | undefined;
  /**
   * The **`overflow-wrap`** CSS property applies to inline elements, setting whether the browser should insert line breaks within an otherwise unbreakable string to prevent text from overflowing its line box.
   * 
   * **Syntax**: `normal | break-word`
   * 
   * **Initial value**: `normal`
   */
  wordWrap?: WordWrap | undefined;
  /**
   * The **`writing-mode`** CSS property sets whether lines of text are laid out horizontally or vertically, as well as the direction in which blocks progress. When set for an entire document, it should be set on the root element (`html` element for HTML documents).
   * 
   * **Syntax**: `horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr`
   * 
   * **Initial value**: `horizontal-tb`
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |  IE   |
   * | :-----: | :-----: | :-------: | :----: | :---: |
   * | **48**  | **41**  | **10.1**  | **12** | **9** |
   * | 8 _-x-_ |         | 5.1 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/writing-mode
   */
  writingMode?: WritingMode | undefined;
  /**
   * The **`z-index`** CSS property sets the z-order of a positioned element and its descendants or flex items. Overlapping elements with a larger z-index cover those with a smaller one.
   * 
   * **Syntax**: `auto | <integer>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/z-index
   */
  zIndex?: ZIndex | undefined;
  /**
   * The non-standard **_`zoom`_** CSS property can be used to control the magnification level of an element. `transform: scale()` should be used instead of this property, if possible. However, unlike CSS Transforms, `zoom` affects the layout size of the element.
   * 
   * **Syntax**: `normal | reset | <number> | <percentage>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |   IE    |
   * | :----: | :-----: | :-----: | :----: | :-----: |
   * | **1**  |   No    | **3.1** | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/zoom
   */
  zoom?: Zoom | undefined;
}

export interface StandardShorthandProperties<TLength = (string & {}) | 0, TTime = string & {}> {
  /**
   * The **`all`** shorthand CSS property resets all of an element's properties except `unicode-bidi`, `direction`, and CSS Custom Properties. It can set properties to their initial or inherited values, or to the values specified in another stylesheet origin.
   * 
   * **Syntax**: `initial | inherit | unset | revert | revert-layer`
   * 
   * **Initial value**: There is no practical initial value for it.
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * | **37** | **27**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/all
   */
  all?: All | undefined;
  /**
   * The **`animation`** shorthand CSS property applies an animation between styles. It is a shorthand for `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`, and `animation-play-state`.
   * 
   * **Syntax**: `<single-animation>#`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation
   */
  animation?: Animation<TTime> | undefined;
  /**
   * The **`background`** shorthand CSS property sets all background style properties at once, such as color, image, origin and size, or repeat method.
   * 
   * **Syntax**: `[ <bg-layer> , ]* <final-bg-layer>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background
   */
  background?: Background<TLength> | undefined;
  /**
   * The **`background-position`** CSS property sets the initial position for each background image. The position is relative to the position layer set by `background-origin`.
   * 
   * **Syntax**: `<bg-position>#`
   * 
   * **Initial value**: `0% 0%`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-position
   */
  backgroundPosition?: BackgroundPosition<TLength> | undefined;
  /**
   * The **`border`** shorthand CSS property sets an element's border. It sets the values of `border-width`, `border-style`, and `border-color`.
   * 
   * **Syntax**: `<line-width> || <line-style> || <color>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border
   */
  border?: Border<TLength> | undefined;
  /**
   * The **`border-block`** CSS property is a shorthand property for setting the individual logical block border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-top-width'> || <'border-top-style'> || <color>`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block
   */
  borderBlock?: BorderBlock<TLength> | undefined;
  /**
   * The **`border-block-end`** CSS property is a shorthand property for setting the individual logical block-end border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-top-width'> || <'border-top-style'> || <color>`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-end
   */
  borderBlockEnd?: BorderBlockEnd<TLength> | undefined;
  /**
   * The **`border-block-start`** CSS property is a shorthand property for setting the individual logical block-start border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-top-width'> || <'border-top-style'> || <color>`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-start
   */
  borderBlockStart?: BorderBlockStart<TLength> | undefined;
  /**
   * The **`border-bottom`** shorthand CSS property sets an element's bottom border. It sets the values of `border-bottom-width`, `border-bottom-style` and `border-bottom-color`.
   * 
   * **Syntax**: `<line-width> || <line-style> || <color>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom
   */
  borderBottom?: BorderBottom<TLength> | undefined;
  /**
   * The **`border-color`** shorthand CSS property sets the color of an element's border.
   * 
   * **Syntax**: `<color>{1,4}`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-color
   */
  borderColor?: BorderColor | undefined;
  /**
   * The **`border-image`** CSS property draws an image around a given element. It replaces the element's regular border.
   * 
   * **Syntax**: `<'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>`
   * 
   * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
   * | :-----: | :-------: | :-----: | :----: | :----: |
   * | **16**  |  **15**   |  **6**  | **12** | **11** |
   * | 7 _-x-_ | 3.5 _-x-_ | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-image
   */
  borderImage?: BorderImage | undefined;
  /**
   * The **`border-inline`** CSS property is a shorthand property for setting the individual logical inline border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-top-width'> || <'border-top-style'> || <color>`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline
   */
  borderInline?: BorderInline<TLength> | undefined;
  /**
   * The **`border-inline-end`** CSS property is a shorthand property for setting the individual logical inline-end border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-top-width'> || <'border-top-style'> || <color>`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end
   */
  borderInlineEnd?: BorderInlineEnd<TLength> | undefined;
  /**
   * The **`border-inline-start`** CSS property is a shorthand property for setting the individual logical inline-start border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-top-width'> || <'border-top-style'> || <color>`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-start
   */
  borderInlineStart?: BorderInlineStart<TLength> | undefined;
  /**
   * The **`border-left`** shorthand CSS property sets all the properties of an element's left border.
   * 
   * **Syntax**: `<line-width> || <line-style> || <color>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-left
   */
  borderLeft?: BorderLeft<TLength> | undefined;
  /**
   * The **`border-radius`** CSS property rounds the corners of an element's outer border edge. You can set a single radius to make circular corners, or two radii to make elliptical corners.
   * 
   * **Syntax**: `<length-percentage>{1,4} [ / <length-percentage>{1,4} ]?`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * |  **4**  |  **4**  |  **5**  | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-radius
   */
  borderRadius?: BorderRadius<TLength> | undefined;
  /**
   * The **`border-right`** shorthand CSS property sets all the properties of an element's right border.
   * 
   * **Syntax**: `<line-width> || <line-style> || <color>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-right
   */
  borderRight?: BorderRight<TLength> | undefined;
  /**
   * The **`border-style`** shorthand CSS property sets the line style for all four sides of an element's border.
   * 
   * **Syntax**: `<line-style>{1,4}`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-style
   */
  borderStyle?: BorderStyle | undefined;
  /**
   * The **`border-top`** shorthand CSS property sets all the properties of an element's top border.
   * 
   * **Syntax**: `<line-width> || <line-style> || <color>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-top
   */
  borderTop?: BorderTop<TLength> | undefined;
  /**
   * The **`border-width`** shorthand CSS property sets the width of an element's border.
   * 
   * **Syntax**: `<line-width>{1,4}`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-width
   */
  borderWidth?: BorderWidth<TLength> | undefined;
  /**
   * The **`column-rule`** shorthand CSS property sets the width, style, and color of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **50**  | **52**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-rule
   */
  columnRule?: ColumnRule<TLength> | undefined;
  /**
   * The **`columns`** CSS shorthand property sets the number of columns to use when drawing an element's contents, as well as those columns' widths.
   * 
   * **Syntax**: `<'column-width'> || <'column-count'>`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |   IE   |
   * | :----: | :-----: | :-----: | :----: | :----: |
   * | **50** | **52**  |  **9**  | **12** | **10** |
   * |        |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/columns
   */
  columns?: Columns<TLength> | undefined;
  /**
   * The **`flex`** CSS shorthand property sets how a flex _item_ will grow or shrink to fit the space available in its flex container.
   * 
   * **Syntax**: `none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |    IE    |
   * | :------: | :-----: | :-----: | :----: | :------: |
   * |  **29**  | **20**  |  **9**  | **12** |  **11**  |
   * | 21 _-x-_ |         | 7 _-x-_ |        | 10 _-x-_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex
   */
  flex?: Flex<TLength> | undefined;
  /**
   * The **`flex-flow`** CSS shorthand property specifies the direction of a flex container, as well as its wrapping behavior.
   * 
   * **Syntax**: `<'flex-direction'> || <'flex-wrap'>`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **28**  |  **9**  | **12** | **11** |
   * | 21 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-flow
   */
  flexFlow?: FlexFlow | undefined;
  /**
   * The **`font`** CSS shorthand property sets all the different properties of an element's font. Alternatively, it sets an element's font to a system font.
   * 
   * **Syntax**: `[ [ <'font-style'> || <font-variant-css21> || <'font-weight'> || <'font-stretch'> ]? <'font-size'> [ / <'line-height'> ]? <'font-family'> ] | caption | icon | menu | message-box | small-caption | status-bar`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font
   */
  font?: Font | undefined;
  /**
   * The **`gap`** CSS property sets the gaps (gutters) between rows and columns. It is a shorthand for `row-gap` and `column-gap`.
   * 
   * **Syntax**: `<'row-gap'> <'column-gap'>?`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/gap
   */
  gap?: Gap<TLength> | undefined;
  /**
   * The **`grid`** CSS property is a shorthand property that sets all of the explicit and implicit grid properties in a single declaration.
   * 
   * **Syntax**: `<'grid-template'> | <'grid-template-rows'> / [ auto-flow && dense? ] <'grid-auto-columns'>? | [ auto-flow && dense? ] <'grid-auto-rows'>? / <'grid-template-columns'>`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid
   */
  grid?: Grid | undefined;
  /**
   * The **`grid-area`** CSS shorthand property specifies a grid item's size and location within a grid by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the edges of its grid area.
   * 
   * **Syntax**: `<grid-line> [ / <grid-line> ]{0,3}`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-area
   */
  gridArea?: GridArea | undefined;
  /**
   * The **`grid-column`** CSS shorthand property specifies a grid item's size and location within a grid column by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area.
   * 
   * **Syntax**: `<grid-line> [ / <grid-line> ]?`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-column
   */
  gridColumn?: GridColumn | undefined;
  /**
   * The **`grid-row`** CSS shorthand property specifies a grid item's size and location within the grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area.
   * 
   * **Syntax**: `<grid-line> [ / <grid-line> ]?`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-row
   */
  gridRow?: GridRow | undefined;
  /**
   * The **`grid-template`** CSS property is a shorthand property for defining grid columns, rows, and areas.
   * 
   * **Syntax**: `none | [ <'grid-template-rows'> / <'grid-template-columns'> ] | [ <line-names>? <string> <track-size>? <line-names>? ]+ [ / <explicit-track-list> ]?`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-template
   */
  gridTemplate?: GridTemplate | undefined;
  /**
   * **Syntax**: `none | <integer>`
   * 
   * **Initial value**: `none`
   */
  lineClamp?: LineClamp | undefined;
  /**
   * The **`list-style`** CSS shorthand property allows you to set all the list style properties at once.
   * 
   * **Syntax**: `<'list-style-type'> || <'list-style-position'> || <'list-style-image'>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/list-style
   */
  listStyle?: ListStyle | undefined;
  /**
   * The **`margin`** CSS shorthand property sets the margin area on all four sides of an element.
   * 
   * **Syntax**: `[ <length> | <percentage> | auto ]{1,4}`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin
   */
  margin?: Margin<TLength> | undefined;
  /**
   * The **`mask`** CSS shorthand property hides an element (partially or fully) by masking or clipping the image at specific points.
   * 
   * **Syntax**: `<mask-layer>#`
   * 
   * | Chrome | Firefox | Safari  | Edge  | IE  |
   * | :----: | :-----: | :-----: | :---: | :-: |
   * | **1**  |  **2**  | **3.1** | 12-79 | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask
   */
  mask?: Mask<TLength> | undefined;
  /**
   * The **`mask-border`** CSS shorthand property lets you create a mask along the edge of an element's border.
   * 
   * **Syntax**: `<'mask-border-source'> || <'mask-border-slice'> [ / <'mask-border-width'>? [ / <'mask-border-outset'> ]? ]? || <'mask-border-repeat'> || <'mask-border-mode'>`
   * 
   * |              Chrome              | Firefox |               Safari               | Edge | IE  |
   * | :------------------------------: | :-----: | :--------------------------------: | :--: | :-: |
   * | **1** _(-webkit-mask-box-image)_ |   No    | **3.1** _(-webkit-mask-box-image)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-border
   */
  maskBorder?: MaskBorder | undefined;
  /**
   * The **`offset`** CSS shorthand property sets all the properties required for animating an element along a defined path.
   * 
   * **Syntax**: `[ <'offset-position'>? [ <'offset-path'> [ <'offset-distance'> || <'offset-rotate'> ]? ]? ]! [ / <'offset-anchor'> ]?`
   * 
   * |    Chrome     | Firefox | Safari | Edge | IE  |
   * | :-----------: | :-----: | :----: | :--: | :-: |
   * |    **55**     | **72**  | **16** | n/a  | No  |
   * | 46 _(motion)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset
   */
  motion?: Offset<TLength> | undefined;
  /**
   * The **`offset`** CSS shorthand property sets all the properties required for animating an element along a defined path.
   * 
   * **Syntax**: `[ <'offset-position'>? [ <'offset-path'> [ <'offset-distance'> || <'offset-rotate'> ]? ]? ]! [ / <'offset-anchor'> ]?`
   * 
   * |    Chrome     | Firefox | Safari | Edge | IE  |
   * | :-----------: | :-----: | :----: | :--: | :-: |
   * |    **55**     | **72**  | **16** | n/a  | No  |
   * | 46 _(motion)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset
   */
  offset?: Offset<TLength> | undefined;
  /**
   * The **`outline`** CSS shorthand property set all the outline properties in a single declaration.
   * 
   * **Syntax**: `[ <'outline-color'> || <'outline-style'> || <'outline-width'> ]`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  | **1.5** | **1.2** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/outline
   */
  outline?: Outline<TLength> | undefined;
  /**
   * The **`overflow`** CSS shorthand property sets the desired behavior for an element's overflow — i.e. when an element's content is too big to fit in its block formatting context — in both directions.
   * 
   * **Syntax**: `[ visible | hidden | clip | scroll | auto ]{1,2}`
   * 
   * **Initial value**: `visible`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow
   */
  overflow?: Overflow | undefined;
  /**
   * The **`overscroll-behavior`** CSS property sets what a browser does when reaching the boundary of a scrolling area. It's a shorthand for `overscroll-behavior-x` and `overscroll-behavior-y`.
   * 
   * **Syntax**: `[ contain | none | auto ]{1,2}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **63** | **59**  | **16** | **18** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior
   */
  overscrollBehavior?: OverscrollBehavior | undefined;
  /**
   * The **`padding`** CSS shorthand property sets the padding area on all four sides of an element at once.
   * 
   * **Syntax**: `[ <length> | <percentage> ]{1,4}`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding
   */
  padding?: Padding<TLength> | undefined;
  /**
   * The CSS **`place-items`** shorthand property allows you to align items along both the block and inline directions at once (i.e. the `align-items` and `justify-items` properties) in a relevant layout system such as Grid or Flexbox. If the second value is not set, the first value is also used for it.
   * 
   * **Syntax**: `<'align-items'> <'justify-items'>?`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **59** | **45**  | **11** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/place-items
   */
  placeItems?: PlaceItems | undefined;
  /**
   * The **`place-self`** CSS shorthand property allows you to align an individual item in both the block and inline directions at once (i.e. the `align-self` and `justify-self` properties) in a relevant layout system such as Grid or Flexbox. If the second value is not present, the first value is also used for it.
   * 
   * **Syntax**: `<'align-self'> <'justify-self'>?`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **59** | **45**  | **11** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/place-self
   */
  placeSelf?: PlaceSelf | undefined;
  /**
   * The **`text-decoration`** shorthand CSS property sets the appearance of decorative lines on text. It is a shorthand for `text-decoration-line`, `text-decoration-color`, `text-decoration-style`, and the newer `text-decoration-thickness` property.
   * 
   * **Syntax**: `<'text-decoration-line'> || <'text-decoration-style'> || <'text-decoration-color'> || <'text-decoration-thickness'>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration
   */
  textDecoration?: TextDecoration<TLength> | undefined;
  /**
   * The **`text-emphasis`** CSS property applies emphasis marks to text (except spaces and control characters). It is a shorthand for `text-emphasis-style` and `text-emphasis-color`.
   * 
   * **Syntax**: `<'text-emphasis-style'> || <'text-emphasis-color'>`
   * 
   * |  Chrome  | Firefox | Safari | Edge | IE  |
   * | :------: | :-----: | :----: | :--: | :-: |
   * |  **99**  | **46**  | **7**  | n/a  | No  |
   * | 25 _-x-_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis
   */
  textEmphasis?: TextEmphasis | undefined;
  /**
   * The **`transition`** CSS property is a shorthand property for `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.
   * 
   * **Syntax**: `<single-transition>#`
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
   * | :-----: | :-----: | :-------: | :----: | :----: |
   * | **26**  | **16**  |   **9**   | **12** | **10** |
   * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/transition
   */
  transition?: Transition<TTime> | undefined;
}

export interface VendorLonghandProperties<TLength = (string & {}) | 0, TTime = string & {}> {
  /**
   * The **`animation-delay`** CSS property specifies the amount of time to wait from applying the animation to an element before beginning to perform the animation. The animation can start later, immediately from its beginning, or immediately and partway through the animation.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  MozAnimationDelay?: AnimationDelay<TTime> | undefined;
  /**
   * The **`animation-direction`** CSS property sets whether an animation should play forward, backward, or alternate back and forth between playing the sequence forward and backward.
   * 
   * **Syntax**: `<single-animation-direction>#`
   * 
   * **Initial value**: `normal`
   */
  MozAnimationDirection?: AnimationDirection | undefined;
  /**
   * The **`animation-duration`** CSS property sets the length of time that an animation takes to complete one cycle.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  MozAnimationDuration?: AnimationDuration<TTime> | undefined;
  /**
   * The **`animation-fill-mode`** CSS property sets how a CSS animation applies styles to its target before and after its execution.
   * 
   * **Syntax**: `<single-animation-fill-mode>#`
   * 
   * **Initial value**: `none`
   */
  MozAnimationFillMode?: AnimationFillMode | undefined;
  /**
   * The **`animation-iteration-count`** CSS property sets the number of times an animation sequence should be played before stopping.
   * 
   * **Syntax**: `<single-animation-iteration-count>#`
   * 
   * **Initial value**: `1`
   */
  MozAnimationIterationCount?: AnimationIterationCount | undefined;
  /**
   * The **`animation-name`** CSS property specifies the names of one or more `@keyframes` at-rules describing the animation or animations to apply to the element.
   * 
   * **Syntax**: `[ none | <keyframes-name> ]#`
   * 
   * **Initial value**: `none`
   */
  MozAnimationName?: AnimationName | undefined;
  /**
   * The **`animation-play-state`** CSS property sets whether an animation is running or paused.
   * 
   * **Syntax**: `<single-animation-play-state>#`
   * 
   * **Initial value**: `running`
   */
  MozAnimationPlayState?: AnimationPlayState | undefined;
  /**
   * The **`animation-timing-function`** CSS property sets how an animation progresses through the duration of each cycle.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   */
  MozAnimationTimingFunction?: AnimationTimingFunction | undefined;
  /**
   * The **`appearance`** CSS property is used to display an element using platform-native styling, based on the operating system's theme. The **`-moz-appearance`** and **`-webkit-appearance`** properties are non-standard versions of this property, used (respectively) by Gecko (Firefox) and by WebKit-based (e.g., Safari) and Blink-based (e.g., Chrome, Opera) browsers to achieve the same thing. Note that Firefox and Edge also support **`-webkit-appearance`**, for compatibility reasons.
   * 
   * **Syntax**: `none | button | button-arrow-down | button-arrow-next | button-arrow-previous | button-arrow-up | button-bevel | button-focus | caret | checkbox | checkbox-container | checkbox-label | checkmenuitem | dualbutton | groupbox | listbox | listitem | menuarrow | menubar | menucheckbox | menuimage | menuitem | menuitemtext | menulist | menulist-button | menulist-text | menulist-textfield | menupopup | menuradio | menuseparator | meterbar | meterchunk | progressbar | progressbar-vertical | progresschunk | progresschunk-vertical | radio | radio-container | radio-label | radiomenuitem | range | range-thumb | resizer | resizerpanel | scale-horizontal | scalethumbend | scalethumb-horizontal | scalethumbstart | scalethumbtick | scalethumb-vertical | scale-vertical | scrollbarbutton-down | scrollbarbutton-left | scrollbarbutton-right | scrollbarbutton-up | scrollbarthumb-horizontal | scrollbarthumb-vertical | scrollbartrack-horizontal | scrollbartrack-vertical | searchfield | separator | sheet | spinner | spinner-downbutton | spinner-textfield | spinner-upbutton | splitter | statusbar | statusbarpanel | tab | tabpanel | tabpanels | tab-scroll-arrow-back | tab-scroll-arrow-forward | textfield | textfield-multiline | toolbar | toolbarbutton | toolbarbutton-dropdown | toolbargripper | toolbox | tooltip | treeheader | treeheadercell | treeheadersortarrow | treeitem | treeline | treetwisty | treetwistyopen | treeview | -moz-mac-unified-toolbar | -moz-win-borderless-glass | -moz-win-browsertabbar-toolbox | -moz-win-communicationstext | -moz-win-communications-toolbox | -moz-win-exclude-glass | -moz-win-glass | -moz-win-mediatext | -moz-win-media-toolbox | -moz-window-button-box | -moz-window-button-box-maximized | -moz-window-button-close | -moz-window-button-maximize | -moz-window-button-minimize | -moz-window-button-restore | -moz-window-frame-bottom | -moz-window-frame-left | -moz-window-frame-right | -moz-window-titlebar | -moz-window-titlebar-maximized`
   * 
   * **Initial value**: `none` (but this value is overridden in the user agent CSS)
   */
  MozAppearance?: MozAppearance | undefined;
  /**
   * The **`backface-visibility`** CSS property sets whether the back face of an element is visible when turned towards the user.
   * 
   * **Syntax**: `visible | hidden`
   * 
   * **Initial value**: `visible`
   */
  MozBackfaceVisibility?: BackfaceVisibility | undefined;
  /**
   * In Mozilla applications like Firefox, the **`-moz-border-bottom-colors`** CSS property sets a list of colors for the bottom border.
   * 
   * **Syntax**: `<color>+ | none`
   * 
   * **Initial value**: `none`
   */
  MozBorderBottomColors?: MozBorderBottomColors | undefined;
  /**
   * The **`border-inline-end-color`** CSS property defines the color of the logical inline-end border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   */
  MozBorderEndColor?: BorderInlineEndColor | undefined;
  /**
   * The **`border-inline-end-style`** CSS property defines the style of the logical inline end border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   */
  MozBorderEndStyle?: BorderInlineEndStyle | undefined;
  /**
   * The **`border-inline-end-width`** CSS property defines the width of the logical inline-end border of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width`, `border-right-width`, `border-bottom-width`, or `border-left-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   */
  MozBorderEndWidth?: BorderInlineEndWidth<TLength> | undefined;
  /**
   * In Mozilla applications like Firefox, the **`-moz-border-left-colors`** CSS property sets a list of colors for the left border.
   * 
   * **Syntax**: `<color>+ | none`
   * 
   * **Initial value**: `none`
   */
  MozBorderLeftColors?: MozBorderLeftColors | undefined;
  /**
   * In Mozilla applications like Firefox, the **`-moz-border-right-colors`** CSS property sets a list of colors for the right border.
   * 
   * **Syntax**: `<color>+ | none`
   * 
   * **Initial value**: `none`
   */
  MozBorderRightColors?: MozBorderRightColors | undefined;
  /**
   * The **`border-inline-start-color`** CSS property defines the color of the logical inline start border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   */
  MozBorderStartColor?: BorderInlineStartColor | undefined;
  /**
   * The **`border-inline-start-style`** CSS property defines the style of the logical inline start border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   */
  MozBorderStartStyle?: BorderInlineStartStyle | undefined;
  /**
   * In Mozilla applications like Firefox, the **`-moz-border-top-colors`** CSS property sets a list of colors for the top border.
   * 
   * **Syntax**: `<color>+ | none`
   * 
   * **Initial value**: `none`
   */
  MozBorderTopColors?: MozBorderTopColors | undefined;
  /**
   * The **`box-sizing`** CSS property sets how the total width and height of an element is calculated.
   * 
   * **Syntax**: `content-box | border-box`
   * 
   * **Initial value**: `content-box`
   */
  MozBoxSizing?: BoxSizing | undefined;
  /**
   * The **`column-count`** CSS property breaks an element's content into the specified number of columns.
   * 
   * **Syntax**: `<integer> | auto`
   * 
   * **Initial value**: `auto`
   */
  MozColumnCount?: ColumnCount | undefined;
  /**
   * The **`column-fill`** CSS property controls how an element's contents are balanced when broken into columns.
   * 
   * **Syntax**: `auto | balance | balance-all`
   * 
   * **Initial value**: `balance`
   */
  MozColumnFill?: ColumnFill | undefined;
  /**
   * The **`column-rule-color`** CSS property sets the color of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  MozColumnRuleColor?: ColumnRuleColor | undefined;
  /**
   * The **`column-rule-style`** CSS property sets the style of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'border-style'>`
   * 
   * **Initial value**: `none`
   */
  MozColumnRuleStyle?: ColumnRuleStyle | undefined;
  /**
   * The **`column-rule-width`** CSS property sets the width of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'border-width'>`
   * 
   * **Initial value**: `medium`
   */
  MozColumnRuleWidth?: ColumnRuleWidth<TLength> | undefined;
  /**
   * The **`column-width`** CSS property sets the ideal column width in a multi-column layout. The container will have as many columns as can fit without any of them having a width less than the `column-width` value. If the width of the container is narrower than the specified value, the single column's width will be smaller than the declared column width.
   * 
   * **Syntax**: `<length> | auto`
   * 
   * **Initial value**: `auto`
   */
  MozColumnWidth?: ColumnWidth<TLength> | undefined;
  /**
   * The **`-moz-context-properties`** property can be used within privileged contexts in Firefox to share the values of specified properties of the element with a child SVG image.
   * 
   * **Syntax**: `none | [ fill | fill-opacity | stroke | stroke-opacity ]#`
   * 
   * **Initial value**: `none`
   */
  MozContextProperties?: MozContextProperties | undefined;
  /**
   * The **`font-feature-settings`** CSS property controls advanced typographic features in OpenType fonts.
   * 
   * **Syntax**: `normal | <feature-tag-value>#`
   * 
   * **Initial value**: `normal`
   */
  MozFontFeatureSettings?: FontFeatureSettings | undefined;
  /**
   * The **`font-language-override`** CSS property controls the use of language-specific glyphs in a typeface.
   * 
   * **Syntax**: `normal | <string>`
   * 
   * **Initial value**: `normal`
   */
  MozFontLanguageOverride?: FontLanguageOverride | undefined;
  /**
   * The **`hyphens`** CSS property specifies how words should be hyphenated when text wraps across multiple lines. It can prevent hyphenation entirely, hyphenate at manually-specified points within the text, or let the browser automatically insert hyphens where appropriate.
   * 
   * **Syntax**: `none | manual | auto`
   * 
   * **Initial value**: `manual`
   */
  MozHyphens?: Hyphens | undefined;
  /**
   * For certain XUL elements and pseudo-elements that use an image from the `list-style-image` property, this property specifies a region of the image that is used in place of the whole image. This allows elements to use different pieces of the same image to improve performance.
   * 
   * **Syntax**: `<shape> | auto`
   * 
   * **Initial value**: `auto`
   */
  MozImageRegion?: MozImageRegion | undefined;
  /**
   * The **`margin-inline-end`** CSS property defines the logical inline end margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation. In other words, it corresponds to the `margin-top`, `margin-right`, `margin-bottom` or `margin-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   */
  MozMarginEnd?: MarginInlineEnd<TLength> | undefined;
  /**
   * The **`margin-inline-start`** CSS property defines the logical inline start margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation. It corresponds to the `margin-top`, `margin-right`, `margin-bottom`, or `margin-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   */
  MozMarginStart?: MarginInlineStart<TLength> | undefined;
  /**
   * The **`-moz-orient`** CSS property specifies the orientation of the element to which it's applied.
   * 
   * **Syntax**: `inline | block | horizontal | vertical`
   * 
   * **Initial value**: `inline`
   */
  MozOrient?: MozOrient | undefined;
  /**
   * The **`font-smooth`** CSS property controls the application of anti-aliasing when fonts are rendered.
   * 
   * **Syntax**: `auto | never | always | <absolute-size> | <length>`
   * 
   * **Initial value**: `auto`
   */
  MozOsxFontSmoothing?: FontSmooth<TLength> | undefined;
  /**
   * The **`padding-inline-end`** CSS property defines the logical inline end padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   */
  MozPaddingEnd?: PaddingInlineEnd<TLength> | undefined;
  /**
   * The **`padding-inline-start`** CSS property defines the logical inline start padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   */
  MozPaddingStart?: PaddingInlineStart<TLength> | undefined;
  /**
   * The **`perspective`** CSS property determines the distance between the z=0 plane and the user in order to give a 3D-positioned element some perspective.
   * 
   * **Syntax**: `none | <length>`
   * 
   * **Initial value**: `none`
   */
  MozPerspective?: Perspective<TLength> | undefined;
  /**
   * The **`perspective-origin`** CSS property determines the position at which the viewer is looking. It is used as the _vanishing point_ by the `perspective` property.
   * 
   * **Syntax**: `<position>`
   * 
   * **Initial value**: `50% 50%`
   */
  MozPerspectiveOrigin?: PerspectiveOrigin<TLength> | undefined;
  /**
   * **`-moz-stack-sizing`** is an extended CSS property. Normally, a `<xul:stack>` will change its size so that all of its child elements are completely visible. For example, moving a child of the stack far to the right will widen the stack so the child remains visible.
   * 
   * **Syntax**: `ignore | stretch-to-fit`
   * 
   * **Initial value**: `stretch-to-fit`
   */
  MozStackSizing?: MozStackSizing | undefined;
  /**
   * The **`tab-size`** CSS property is used to customize the width of tab characters (U+0009).
   * 
   * **Syntax**: `<integer> | <length>`
   * 
   * **Initial value**: `8`
   */
  MozTabSize?: TabSize<TLength> | undefined;
  /**
   * The **`-moz-text-blink`** non-standard Mozilla CSS extension specifies the blink mode.
   * 
   * **Syntax**: `none | blink`
   * 
   * **Initial value**: `none`
   */
  MozTextBlink?: MozTextBlink | undefined;
  /**
   * The **`text-size-adjust`** CSS property controls the text inflation algorithm used on some smartphones and tablets. Other browsers will ignore this property.
   * 
   * **Syntax**: `none | auto | <percentage>`
   * 
   * **Initial value**: `auto` for smartphone browsers supporting inflation, `none` in other cases (and then not modifiable).
   */
  MozTextSizeAdjust?: TextSizeAdjust | undefined;
  /**
   * The **`transform-origin`** CSS property sets the origin for an element's transformations.
   * 
   * **Syntax**: `[ <length-percentage> | left | center | right | top | bottom ] | [ [ <length-percentage> | left | center | right ] && [ <length-percentage> | top | center | bottom ] ] <length>?`
   * 
   * **Initial value**: `50% 50% 0`
   */
  MozTransformOrigin?: TransformOrigin<TLength> | undefined;
  /**
   * The **`transform-style`** CSS property sets whether children of an element are positioned in the 3D space or are flattened in the plane of the element.
   * 
   * **Syntax**: `flat | preserve-3d`
   * 
   * **Initial value**: `flat`
   */
  MozTransformStyle?: TransformStyle | undefined;
  /**
   * The **`transition-delay`** CSS property specifies the duration to wait before starting a property's transition effect when its value changes.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  MozTransitionDelay?: TransitionDelay<TTime> | undefined;
  /**
   * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  MozTransitionDuration?: TransitionDuration<TTime> | undefined;
  /**
   * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
   * 
   * **Syntax**: `none | <single-transition-property>#`
   * 
   * **Initial value**: all
   */
  MozTransitionProperty?: TransitionProperty | undefined;
  /**
   * The **`transition-timing-function`** CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   */
  MozTransitionTimingFunction?: TransitionTimingFunction | undefined;
  /**
   * The **`-moz-user-focus`** CSS property is used to indicate whether an element can have the focus.
   * 
   * **Syntax**: `ignore | normal | select-after | select-before | select-menu | select-same | select-all | none`
   * 
   * **Initial value**: `none`
   */
  MozUserFocus?: MozUserFocus | undefined;
  /**
   * The **`user-modify`** property has no effect in Firefox. It was originally planned to determine whether or not the content of an element can be edited by a user.
   * 
   * **Syntax**: `read-only | read-write | write-only`
   * 
   * **Initial value**: `read-only`
   */
  MozUserModify?: MozUserModify | undefined;
  /**
   * The **`user-select`** CSS property controls whether the user can select text. This doesn't have any effect on content loaded as part of a browser's user interface (its chrome), except in textboxes.
   * 
   * **Syntax**: `auto | text | none | contain | all`
   * 
   * **Initial value**: `auto`
   */
  MozUserSelect?: UserSelect | undefined;
  /**
   * The **`-moz-window-dragging`** CSS property specifies whether a window is draggable or not. It only works in Chrome code, and only on Mac OS X.
   * 
   * **Syntax**: `drag | no-drag`
   * 
   * **Initial value**: `drag`
   */
  MozWindowDragging?: MozWindowDragging | undefined;
  /**
   * The **`-moz-window-shadow`** CSS property specifies whether a window will have a shadow. It only works on Mac OS X.
   * 
   * **Syntax**: `default | menu | tooltip | sheet | none`
   * 
   * **Initial value**: `default`
   */
  MozWindowShadow?: MozWindowShadow | undefined;
  /**
   * The **`-ms-accelerator`** CSS property is a Microsoft extension that sets or retrieves a string indicating whether the object represents a keyboard shortcut.
   * 
   * **Syntax**: `false | true`
   * 
   * **Initial value**: `false`
   */
  msAccelerator?: MsAccelerator | undefined;
  /**
   * The **`-ms-block-progression`** CSS property is a Microsoft extension that specifies the block progression and layout orientation.
   * 
   * **Syntax**: `tb | rl | bt | lr`
   * 
   * **Initial value**: `tb`
   */
  msBlockProgression?: MsBlockProgression | undefined;
  /**
   * The **`-ms-content-zoom-chaining`** CSS property is a Microsoft extension specifying the zoom behavior that occurs when a user hits the zoom limit during page manipulation.
   * 
   * **Syntax**: `none | chained`
   * 
   * **Initial value**: `none`
   */
  msContentZoomChaining?: MsContentZoomChaining | undefined;
  /**
   * The **`-ms-content-zoom-limit-max`** CSS property is a Microsoft extension that specifies the selected elements' maximum zoom factor.
   * 
   * **Syntax**: `<percentage>`
   * 
   * **Initial value**: `400%`
   */
  msContentZoomLimitMax?: MsContentZoomLimitMax | undefined;
  /**
   * The **`-ms-content-zoom-limit-min`** CSS property is a Microsoft extension that specifies the minimum zoom factor.
   * 
   * **Syntax**: `<percentage>`
   * 
   * **Initial value**: `100%`
   */
  msContentZoomLimitMin?: MsContentZoomLimitMin | undefined;
  /**
   * The **`-ms-content-zoom-snap-points`** CSS property is a Microsoft extension that specifies where zoom snap-points are located.
   * 
   * **Syntax**: `snapInterval( <percentage>, <percentage> ) | snapList( <percentage># )`
   * 
   * **Initial value**: `snapInterval(0%, 100%)`
   */
  msContentZoomSnapPoints?: MsContentZoomSnapPoints | undefined;
  /**
   * The **`-ms-content-zoom-snap-type`** CSS property is a Microsoft extension that specifies how zooming is affected by defined snap-points.
   * 
   * **Syntax**: `none | proximity | mandatory`
   * 
   * **Initial value**: `none`
   */
  msContentZoomSnapType?: MsContentZoomSnapType | undefined;
  /**
   * The **`-ms-content-zooming`** CSS property is a Microsoft extension that specifies whether zooming is enabled.
   * 
   * **Syntax**: `none | zoom`
   * 
   * **Initial value**: zoom for the top level element, none for all other elements
   */
  msContentZooming?: MsContentZooming | undefined;
  /**
   * The `-ms-filter` CSS property is a Microsoft extension that sets or retrieves the filter or collection of filters applied to an object.
   * 
   * **Syntax**: `<string>`
   * 
   * **Initial value**: "" (the empty string)
   */
  msFilter?: MsFilter | undefined;
  /**
   * The **`flex-direction`** CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).
   * 
   * **Syntax**: `row | row-reverse | column | column-reverse`
   * 
   * **Initial value**: `row`
   */
  msFlexDirection?: FlexDirection | undefined;
  /**
   * The **`flex-grow`** CSS property sets the flex grow factor of a flex item's main size.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   */
  msFlexPositive?: FlexGrow | undefined;
  /**
   * The **`-ms-flow-from`** CSS property is a Microsoft extension that gets or sets a value identifying a region container in the document that accepts the content flow from the data source.
   * 
   * **Syntax**: `[ none | <custom-ident> ]#`
   * 
   * **Initial value**: `none`
   */
  msFlowFrom?: MsFlowFrom | undefined;
  /**
   * The **`-ms-flow-into`** CSS property is a Microsoft extension that gets or sets a value identifying an iframe container in the document that serves as the region's data source.
   * 
   * **Syntax**: `[ none | <custom-ident> ]#`
   * 
   * **Initial value**: `none`
   */
  msFlowInto?: MsFlowInto | undefined;
  /**
   * The **`grid-template-columns`** CSS property defines the line names and track sizing functions of the grid columns.
   * 
   * **Syntax**: `none | <track-list> | <auto-track-list>`
   * 
   * **Initial value**: `none`
   */
  msGridColumns?: MsGridColumns<TLength> | undefined;
  /**
   * The **`grid-template-rows`** CSS property defines the line names and track sizing functions of the grid rows.
   * 
   * **Syntax**: `none | <track-list> | <auto-track-list>`
   * 
   * **Initial value**: `none`
   */
  msGridRows?: MsGridRows<TLength> | undefined;
  /**
   * The **`-ms-high-contrast-adjust`** CSS property is a Microsoft extension that gets or sets a value indicating whether to override any CSS properties that would have been set in high contrast mode.
   * 
   * **Syntax**: `auto | none`
   * 
   * **Initial value**: `auto`
   */
  msHighContrastAdjust?: MsHighContrastAdjust | undefined;
  /**
   * The **`-ms-hyphenate-limit-chars`** CSS property is a Microsoft extension that specifies one to three values indicating the minimum number of characters in a hyphenated word. If the word does not meet the required minimum number of characters in the word, before the hyphen, or after the hyphen, then the word is not hyphenated.
   * 
   * **Syntax**: `auto | <integer>{1,3}`
   * 
   * **Initial value**: `auto`
   */
  msHyphenateLimitChars?: MsHyphenateLimitChars | undefined;
  /**
   * The **`-ms-hyphenate-limit-lines`** CSS property is a Microsoft extension specifying the maximum number of consecutive lines in an element that may be ended with a hyphenated word.
   * 
   * **Syntax**: `no-limit | <integer>`
   * 
   * **Initial value**: `no-limit`
   */
  msHyphenateLimitLines?: MsHyphenateLimitLines | undefined;
  /**
   * The `**-ms-hyphenate-limit-zone**` CSS property is a Microsoft extension specifying the width of the hyphenation zone.
   * 
   * **Syntax**: `<percentage> | <length>`
   * 
   * **Initial value**: `0`
   */
  msHyphenateLimitZone?: MsHyphenateLimitZone<TLength> | undefined;
  /**
   * The **`hyphens`** CSS property specifies how words should be hyphenated when text wraps across multiple lines. It can prevent hyphenation entirely, hyphenate at manually-specified points within the text, or let the browser automatically insert hyphens where appropriate.
   * 
   * **Syntax**: `none | manual | auto`
   * 
   * **Initial value**: `manual`
   */
  msHyphens?: Hyphens | undefined;
  /**
   * The **`-ms-ime-align`** CSS property is a Microsoft extension aligning the Input Method Editor (IME) candidate window box relative to the element on which the IME composition is active. The extension is implemented in Microsoft Edge and Internet Explorer 11.
   * 
   * **Syntax**: `auto | after`
   * 
   * **Initial value**: `auto`
   */
  msImeAlign?: MsImeAlign | undefined;
  /**
   * The **`line-break`** CSS property sets how to break lines of Chinese, Japanese, or Korean (CJK) text when working with punctuation and symbols.
   * 
   * **Syntax**: `auto | loose | normal | strict | anywhere`
   * 
   * **Initial value**: `auto`
   */
  msLineBreak?: LineBreak | undefined;
  /**
   * The **`order`** CSS property sets the order to lay out an item in a flex or grid container. Items in a container are sorted by ascending `order` value and then by their source code order.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `0`
   */
  msOrder?: Order | undefined;
  /**
   * The **`-ms-overflow-style`** CSS property is a Microsoft extension controlling the behavior of scrollbars when the content of an element overflows.
   * 
   * **Syntax**: `auto | none | scrollbar | -ms-autohiding-scrollbar`
   * 
   * **Initial value**: `auto`
   */
  msOverflowStyle?: MsOverflowStyle | undefined;
  /**
   * The **`overflow-x`** CSS property sets what shows when content overflows a block-level element's left and right edges. This may be nothing, a scroll bar, or the overflow content.
   * 
   * **Syntax**: `visible | hidden | clip | scroll | auto`
   * 
   * **Initial value**: `visible`
   */
  msOverflowX?: OverflowX | undefined;
  /**
   * The **`overflow-y`** CSS property sets what shows when content overflows a block-level element's top and bottom edges. This may be nothing, a scroll bar, or the overflow content.
   * 
   * **Syntax**: `visible | hidden | clip | scroll | auto`
   * 
   * **Initial value**: `visible`
   */
  msOverflowY?: OverflowY | undefined;
  /**
   * The `**-ms-scroll-chaining**` CSS property is a Microsoft extension that specifies the scrolling behavior that occurs when a user hits the scroll limit during a manipulation.
   * 
   * **Syntax**: `chained | none`
   * 
   * **Initial value**: `chained`
   */
  msScrollChaining?: MsScrollChaining | undefined;
  /**
   * The `**-ms-scroll-limit-x-max**` CSS property is a Microsoft extension that specifies the maximum value for the `Element.scrollLeft` property.
   * 
   * **Syntax**: `auto | <length>`
   * 
   * **Initial value**: `auto`
   */
  msScrollLimitXMax?: MsScrollLimitXMax<TLength> | undefined;
  /**
   * The **`-ms-scroll-limit-x-min`** CSS property is a Microsoft extension that specifies the minimum value for the `Element.scrollLeft` property.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   */
  msScrollLimitXMin?: MsScrollLimitXMin<TLength> | undefined;
  /**
   * The **`-ms-scroll-limit-y-max`** CSS property is a Microsoft extension that specifies the maximum value for the `Element.scrollTop` property.
   * 
   * **Syntax**: `auto | <length>`
   * 
   * **Initial value**: `auto`
   */
  msScrollLimitYMax?: MsScrollLimitYMax<TLength> | undefined;
  /**
   * The **`-ms-scroll-limit-y-min`** CSS property is a Microsoft extension that specifies the minimum value for the `Element.scrollTop` property.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   */
  msScrollLimitYMin?: MsScrollLimitYMin<TLength> | undefined;
  /**
   * The **`-ms-scroll-rails`** CSS property is a Microsoft extension that specifies whether scrolling locks to the primary axis of motion.
   * 
   * **Syntax**: `none | railed`
   * 
   * **Initial value**: `railed`
   */
  msScrollRails?: MsScrollRails | undefined;
  /**
   * The **`-ms-scroll-snap-points-x`** CSS property is a Microsoft extension that specifies where snap-points will be located along the x-axis.
   * 
   * **Syntax**: `snapInterval( <length-percentage>, <length-percentage> ) | snapList( <length-percentage># )`
   * 
   * **Initial value**: `snapInterval(0px, 100%)`
   */
  msScrollSnapPointsX?: MsScrollSnapPointsX | undefined;
  /**
   * The **`-ms-scroll-snap-points-y`** CSS property is a Microsoft extension that specifies where snap-points will be located along the y-axis.
   * 
   * **Syntax**: `snapInterval( <length-percentage>, <length-percentage> ) | snapList( <length-percentage># )`
   * 
   * **Initial value**: `snapInterval(0px, 100%)`
   */
  msScrollSnapPointsY?: MsScrollSnapPointsY | undefined;
  /**
   * The **`scroll-snap-type`** CSS property sets how strictly snap points are enforced on the scroll container in case there is one.
   * 
   * **Syntax**: `none | proximity | mandatory`
   * 
   * **Initial value**: `none`
   */
  msScrollSnapType?: MsScrollSnapType | undefined;
  /**
   * The **`-ms-scroll-translation`** CSS property is a Microsoft extension that specifies whether vertical-to-horizontal scroll wheel translation occurs on the specified element.
   * 
   * **Syntax**: `none | vertical-to-horizontal`
   * 
   * **Initial value**: `none`
   */
  msScrollTranslation?: MsScrollTranslation | undefined;
  /**
   * The **`-ms-scrollbar-3dlight-color`** CSS property is a Microsoft extension specifying the color of the top and left edges of the scroll box and scroll arrows of a scroll bar.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: depends on user agent
   */
  msScrollbar3dlightColor?: MsScrollbar3dlightColor | undefined;
  /**
   * The **`-ms-scrollbar-arrow-color`** CSS property is a Microsoft extension that specifies the color of the arrow elements of a scroll arrow.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `ButtonText`
   */
  msScrollbarArrowColor?: MsScrollbarArrowColor | undefined;
  /**
   * The `**-ms-scrollbar-base-color**` CSS property is a Microsoft extension that specifies the base color of the main elements of a scroll bar.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: depends on user agent
   */
  msScrollbarBaseColor?: MsScrollbarBaseColor | undefined;
  /**
   * The **`-ms-scrollbar-darkshadow-color`** CSS property is a Microsoft extension that specifies the color of a scroll bar's gutter.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `ThreeDDarkShadow`
   */
  msScrollbarDarkshadowColor?: MsScrollbarDarkshadowColor | undefined;
  /**
   * The `**-ms-scrollbar-face-color**` CSS property is a Microsoft extension that specifies the color of the scroll box and scroll arrows of a scroll bar.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `ThreeDFace`
   */
  msScrollbarFaceColor?: MsScrollbarFaceColor | undefined;
  /**
   * The `**-ms-scrollbar-highlight-color**` CSS property is a Microsoft extension that specifies the color of the slider tray, the top and left edges of the scroll box, and the scroll arrows of a scroll bar.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `ThreeDHighlight`
   */
  msScrollbarHighlightColor?: MsScrollbarHighlightColor | undefined;
  /**
   * The **`-ms-scrollbar-shadow-color`** CSS property is a Microsoft extension that specifies the color of the bottom and right edges of the scroll box and scroll arrows of a scroll bar.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `ThreeDDarkShadow`
   */
  msScrollbarShadowColor?: MsScrollbarShadowColor | undefined;
  /**
   * The **`-ms-scrollbar-track-color`** CSS property is a Microsoft extension that specifies the color of the track element of a scrollbar.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `Scrollbar`
   */
  msScrollbarTrackColor?: MsScrollbarTrackColor | undefined;
  /**
   * The **`-ms-text-autospace`** CSS property is a Microsoft extension that specifies the autospacing and narrow space width adjustment of text.
   * 
   * **Syntax**: `none | ideograph-alpha | ideograph-numeric | ideograph-parenthesis | ideograph-space`
   * 
   * **Initial value**: `none`
   */
  msTextAutospace?: MsTextAutospace | undefined;
  /**
   * The **`text-combine-upright`** CSS property sets the combination of characters into the space of a single character. If the combined text is wider than 1em, the user agent must fit the contents within 1em. The resulting composition is treated as a single upright glyph for layout and decoration. This property only has an effect in vertical writing modes.
   * 
   * **Syntax**: `none | all | [ digits <integer>? ]`
   * 
   * **Initial value**: `none`
   */
  msTextCombineHorizontal?: TextCombineUpright | undefined;
  /**
   * The **`text-overflow`** CSS property sets how hidden overflow content is signaled to users. It can be clipped, display an ellipsis ('`…`'), or display a custom string.
   * 
   * **Syntax**: `[ clip | ellipsis | <string> ]{1,2}`
   * 
   * **Initial value**: `clip`
   */
  msTextOverflow?: TextOverflow | undefined;
  /**
   * The **`touch-action`** CSS property sets how an element's region can be manipulated by a touchscreen user (for example, by zooming features built into the browser).
   * 
   * **Syntax**: `auto | none | [ [ pan-x | pan-left | pan-right ] || [ pan-y | pan-up | pan-down ] || pinch-zoom ] | manipulation`
   * 
   * **Initial value**: `auto`
   */
  msTouchAction?: TouchAction | undefined;
  /**
   * The **`-ms-touch-select`** CSS property is a Microsoft extension that toggles the gripper visual elements that enable touch text selection.
   * 
   * **Syntax**: `grippers | none`
   * 
   * **Initial value**: `grippers`
   */
  msTouchSelect?: MsTouchSelect | undefined;
  /**
   * The **`transform`** CSS property lets you rotate, scale, skew, or translate an element. It modifies the coordinate space of the CSS visual formatting model.
   * 
   * **Syntax**: `none | <transform-list>`
   * 
   * **Initial value**: `none`
   */
  msTransform?: Transform | undefined;
  /**
   * The **`transform-origin`** CSS property sets the origin for an element's transformations.
   * 
   * **Syntax**: `[ <length-percentage> | left | center | right | top | bottom ] | [ [ <length-percentage> | left | center | right ] && [ <length-percentage> | top | center | bottom ] ] <length>?`
   * 
   * **Initial value**: `50% 50% 0`
   */
  msTransformOrigin?: TransformOrigin<TLength> | undefined;
  /**
   * The **`transition-delay`** CSS property specifies the duration to wait before starting a property's transition effect when its value changes.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  msTransitionDelay?: TransitionDelay<TTime> | undefined;
  /**
   * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  msTransitionDuration?: TransitionDuration<TTime> | undefined;
  /**
   * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
   * 
   * **Syntax**: `none | <single-transition-property>#`
   * 
   * **Initial value**: all
   */
  msTransitionProperty?: TransitionProperty | undefined;
  /**
   * The **`transition-timing-function`** CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   */
  msTransitionTimingFunction?: TransitionTimingFunction | undefined;
  /**
   * The `**user-select**` CSS property controls whether the user can select text. This doesn't have any effect on content loaded as chrome, except in textboxes.
   * 
   * **Syntax**: `none | element | text`
   * 
   * **Initial value**: `text`
   */
  msUserSelect?: MsUserSelect | undefined;
  /**
   * The **`word-break`** CSS property sets whether line breaks appear wherever the text would otherwise overflow its content box.
   * 
   * **Syntax**: `normal | break-all | keep-all | break-word`
   * 
   * **Initial value**: `normal`
   */
  msWordBreak?: WordBreak | undefined;
  /**
   * The **`-ms-wrap-flow`** CSS property is a Microsoft extension that specifies how exclusions impact inline content within block-level elements.
   * 
   * **Syntax**: `auto | both | start | end | maximum | clear`
   * 
   * **Initial value**: `auto`
   */
  msWrapFlow?: MsWrapFlow | undefined;
  /**
   * The **`-ms-wrap-margin`** CSS property is a Microsoft extension that specifies a margin that offsets the inner wrap shape from other shapes.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   */
  msWrapMargin?: MsWrapMargin<TLength> | undefined;
  /**
   * The **`-ms-wrap-through`** CSS property is a Microsoft extension that specifies how content should wrap around an exclusion element.
   * 
   * **Syntax**: `wrap | none`
   * 
   * **Initial value**: `wrap`
   */
  msWrapThrough?: MsWrapThrough | undefined;
  /**
   * The **`writing-mode`** CSS property sets whether lines of text are laid out horizontally or vertically, as well as the direction in which blocks progress. When set for an entire document, it should be set on the root element (`html` element for HTML documents).
   * 
   * **Syntax**: `horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr`
   * 
   * **Initial value**: `horizontal-tb`
   */
  msWritingMode?: WritingMode | undefined;
  /**
   * The CSS **`align-content`** property sets the distribution of space between and around content items along a flexbox's cross-axis or a grid's block axis.
   * 
   * **Syntax**: `normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position>`
   * 
   * **Initial value**: `normal`
   */
  WebkitAlignContent?: AlignContent | undefined;
  /**
   * The CSS **`align-items`** property sets the `align-self` value on all direct children as a group. In Flexbox, it controls the alignment of items on the Cross Axis. In Grid Layout, it controls the alignment of items on the Block Axis within their grid area.
   * 
   * **Syntax**: `normal | stretch | <baseline-position> | [ <overflow-position>? <self-position> ]`
   * 
   * **Initial value**: `normal`
   */
  WebkitAlignItems?: AlignItems | undefined;
  /**
   * The **`align-self`** CSS property overrides a grid or flex item's `align-items` value. In Grid, it aligns the item inside the grid area. In Flexbox, it aligns the item on the cross axis.
   * 
   * **Syntax**: `auto | normal | stretch | <baseline-position> | <overflow-position>? <self-position>`
   * 
   * **Initial value**: `auto`
   */
  WebkitAlignSelf?: AlignSelf | undefined;
  /**
   * The **`animation-delay`** CSS property specifies the amount of time to wait from applying the animation to an element before beginning to perform the animation. The animation can start later, immediately from its beginning, or immediately and partway through the animation.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  WebkitAnimationDelay?: AnimationDelay<TTime> | undefined;
  /**
   * The **`animation-direction`** CSS property sets whether an animation should play forward, backward, or alternate back and forth between playing the sequence forward and backward.
   * 
   * **Syntax**: `<single-animation-direction>#`
   * 
   * **Initial value**: `normal`
   */
  WebkitAnimationDirection?: AnimationDirection | undefined;
  /**
   * The **`animation-duration`** CSS property sets the length of time that an animation takes to complete one cycle.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  WebkitAnimationDuration?: AnimationDuration<TTime> | undefined;
  /**
   * The **`animation-fill-mode`** CSS property sets how a CSS animation applies styles to its target before and after its execution.
   * 
   * **Syntax**: `<single-animation-fill-mode>#`
   * 
   * **Initial value**: `none`
   */
  WebkitAnimationFillMode?: AnimationFillMode | undefined;
  /**
   * The **`animation-iteration-count`** CSS property sets the number of times an animation sequence should be played before stopping.
   * 
   * **Syntax**: `<single-animation-iteration-count>#`
   * 
   * **Initial value**: `1`
   */
  WebkitAnimationIterationCount?: AnimationIterationCount | undefined;
  /**
   * The **`animation-name`** CSS property specifies the names of one or more `@keyframes` at-rules describing the animation or animations to apply to the element.
   * 
   * **Syntax**: `[ none | <keyframes-name> ]#`
   * 
   * **Initial value**: `none`
   */
  WebkitAnimationName?: AnimationName | undefined;
  /**
   * The **`animation-play-state`** CSS property sets whether an animation is running or paused.
   * 
   * **Syntax**: `<single-animation-play-state>#`
   * 
   * **Initial value**: `running`
   */
  WebkitAnimationPlayState?: AnimationPlayState | undefined;
  /**
   * The **`animation-timing-function`** CSS property sets how an animation progresses through the duration of each cycle.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   */
  WebkitAnimationTimingFunction?: AnimationTimingFunction | undefined;
  /**
   * The **`appearance`** CSS property is used to display an element using platform-native styling, based on the operating system's theme. The **`-moz-appearance`** and **`-webkit-appearance`** properties are non-standard versions of this property, used (respectively) by Gecko (Firefox) and by WebKit-based (e.g., Safari) and Blink-based (e.g., Chrome, Opera) browsers to achieve the same thing. Note that Firefox and Edge also support **`-webkit-appearance`**, for compatibility reasons.
   * 
   * **Syntax**: `none | button | button-bevel | caret | checkbox | default-button | inner-spin-button | listbox | listitem | media-controls-background | media-controls-fullscreen-background | media-current-time-display | media-enter-fullscreen-button | media-exit-fullscreen-button | media-fullscreen-button | media-mute-button | media-overlay-play-button | media-play-button | media-seek-back-button | media-seek-forward-button | media-slider | media-sliderthumb | media-time-remaining-display | media-toggle-closed-captions-button | media-volume-slider | media-volume-slider-container | media-volume-sliderthumb | menulist | menulist-button | menulist-text | menulist-textfield | meter | progress-bar | progress-bar-value | push-button | radio | searchfield | searchfield-cancel-button | searchfield-decoration | searchfield-results-button | searchfield-results-decoration | slider-horizontal | slider-vertical | sliderthumb-horizontal | sliderthumb-vertical | square-button | textarea | textfield | -apple-pay-button`
   * 
   * **Initial value**: `none` (but this value is overridden in the user agent CSS)
   */
  WebkitAppearance?: WebkitAppearance | undefined;
  /**
   * The **`backdrop-filter`** CSS property lets you apply graphical effects such as blurring or color shifting to the area behind an element. Because it applies to everything _behind_ the element, to see the effect you must make the element or its background at least partially transparent.
   * 
   * **Syntax**: `none | <filter-function-list>`
   * 
   * **Initial value**: `none`
   */
  WebkitBackdropFilter?: BackdropFilter | undefined;
  /**
   * The **`backface-visibility`** CSS property sets whether the back face of an element is visible when turned towards the user.
   * 
   * **Syntax**: `visible | hidden`
   * 
   * **Initial value**: `visible`
   */
  WebkitBackfaceVisibility?: BackfaceVisibility | undefined;
  /**
   * The **`background-clip`** CSS property sets whether an element's background extends underneath its border box, padding box, or content box.
   * 
   * **Syntax**: `<box>#`
   * 
   * **Initial value**: `border-box`
   */
  WebkitBackgroundClip?: BackgroundClip | undefined;
  /**
   * The **`background-origin`** CSS property sets the background's origin: from the border start, inside the border, or inside the padding.
   * 
   * **Syntax**: `<box>#`
   * 
   * **Initial value**: `padding-box`
   */
  WebkitBackgroundOrigin?: BackgroundOrigin | undefined;
  /**
   * The **`background-size`** CSS property sets the size of the element's background image. The image can be left to its natural size, stretched, or constrained to fit the available space.
   * 
   * **Syntax**: `<bg-size>#`
   * 
   * **Initial value**: `auto auto`
   */
  WebkitBackgroundSize?: BackgroundSize<TLength> | undefined;
  /**
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  WebkitBorderBeforeColor?: WebkitBorderBeforeColor | undefined;
  /**
   * **Syntax**: `<'border-style'>`
   * 
   * **Initial value**: `none`
   */
  WebkitBorderBeforeStyle?: WebkitBorderBeforeStyle | undefined;
  /**
   * **Syntax**: `<'border-width'>`
   * 
   * **Initial value**: `medium`
   */
  WebkitBorderBeforeWidth?: WebkitBorderBeforeWidth<TLength> | undefined;
  /**
   * The **`border-bottom-left-radius`** CSS property rounds the bottom-left corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   */
  WebkitBorderBottomLeftRadius?: BorderBottomLeftRadius<TLength> | undefined;
  /**
   * The **`border-bottom-right-radius`** CSS property rounds the bottom-right corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   */
  WebkitBorderBottomRightRadius?: BorderBottomRightRadius<TLength> | undefined;
  /**
   * The **`border-image-slice`** CSS property divides the image specified by `border-image-source` into regions. These regions form the components of an element's border image.
   * 
   * **Syntax**: `<number-percentage>{1,4} && fill?`
   * 
   * **Initial value**: `100%`
   */
  WebkitBorderImageSlice?: BorderImageSlice | undefined;
  /**
   * The **`border-top-left-radius`** CSS property rounds the top-left corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   */
  WebkitBorderTopLeftRadius?: BorderTopLeftRadius<TLength> | undefined;
  /**
   * The **`border-top-right-radius`** CSS property rounds the top-right corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   */
  WebkitBorderTopRightRadius?: BorderTopRightRadius<TLength> | undefined;
  /**
   * The **`box-decoration-break`** CSS property specifies how an element's fragments should be rendered when broken across multiple lines, columns, or pages.
   * 
   * **Syntax**: `slice | clone`
   * 
   * **Initial value**: `slice`
   */
  WebkitBoxDecorationBreak?: BoxDecorationBreak | undefined;
  /**
   * The **`-webkit-box-reflect`** CSS property lets you reflect the content of an element in one specific direction.
   * 
   * **Syntax**: `[ above | below | right | left ]? <length>? <image>?`
   * 
   * **Initial value**: `none`
   */
  WebkitBoxReflect?: WebkitBoxReflect<TLength> | undefined;
  /**
   * The **`box-shadow`** CSS property adds shadow effects around an element's frame. You can set multiple effects separated by commas. A box shadow is described by X and Y offsets relative to the element, blur and spread radius, and color.
   * 
   * **Syntax**: `none | <shadow>#`
   * 
   * **Initial value**: `none`
   */
  WebkitBoxShadow?: BoxShadow | undefined;
  /**
   * The **`box-sizing`** CSS property sets how the total width and height of an element is calculated.
   * 
   * **Syntax**: `content-box | border-box`
   * 
   * **Initial value**: `content-box`
   */
  WebkitBoxSizing?: BoxSizing | undefined;
  /**
   * The **`clip-path`** CSS property creates a clipping region that sets what part of an element should be shown. Parts that are inside the region are shown, while those outside are hidden.
   * 
   * **Syntax**: `<clip-source> | [ <basic-shape> || <geometry-box> ] | none`
   * 
   * **Initial value**: `none`
   */
  WebkitClipPath?: ClipPath | undefined;
  /**
   * The **`column-count`** CSS property breaks an element's content into the specified number of columns.
   * 
   * **Syntax**: `<integer> | auto`
   * 
   * **Initial value**: `auto`
   */
  WebkitColumnCount?: ColumnCount | undefined;
  /**
   * The **`column-fill`** CSS property controls how an element's contents are balanced when broken into columns.
   * 
   * **Syntax**: `auto | balance | balance-all`
   * 
   * **Initial value**: `balance`
   */
  WebkitColumnFill?: ColumnFill | undefined;
  /**
   * The **`column-rule-color`** CSS property sets the color of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  WebkitColumnRuleColor?: ColumnRuleColor | undefined;
  /**
   * The **`column-rule-style`** CSS property sets the style of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'border-style'>`
   * 
   * **Initial value**: `none`
   */
  WebkitColumnRuleStyle?: ColumnRuleStyle | undefined;
  /**
   * The **`column-rule-width`** CSS property sets the width of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'border-width'>`
   * 
   * **Initial value**: `medium`
   */
  WebkitColumnRuleWidth?: ColumnRuleWidth<TLength> | undefined;
  /**
   * The **`column-span`** CSS property makes it possible for an element to span across all columns when its value is set to `all`.
   * 
   * **Syntax**: `none | all`
   * 
   * **Initial value**: `none`
   */
  WebkitColumnSpan?: ColumnSpan | undefined;
  /**
   * The **`column-width`** CSS property sets the ideal column width in a multi-column layout. The container will have as many columns as can fit without any of them having a width less than the `column-width` value. If the width of the container is narrower than the specified value, the single column's width will be smaller than the declared column width.
   * 
   * **Syntax**: `<length> | auto`
   * 
   * **Initial value**: `auto`
   */
  WebkitColumnWidth?: ColumnWidth<TLength> | undefined;
  /**
   * The **`filter`** CSS property applies graphical effects like blur or color shift to an element. Filters are commonly used to adjust the rendering of images, backgrounds, and borders.
   * 
   * **Syntax**: `none | <filter-function-list>`
   * 
   * **Initial value**: `none`
   */
  WebkitFilter?: Filter | undefined;
  /**
   * The **`flex-basis`** CSS property sets the initial main size of a flex item. It sets the size of the content box unless otherwise set with `box-sizing`.
   * 
   * **Syntax**: `content | <'width'>`
   * 
   * **Initial value**: `auto`
   */
  WebkitFlexBasis?: FlexBasis<TLength> | undefined;
  /**
   * The **`flex-direction`** CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).
   * 
   * **Syntax**: `row | row-reverse | column | column-reverse`
   * 
   * **Initial value**: `row`
   */
  WebkitFlexDirection?: FlexDirection | undefined;
  /**
   * The **`flex-grow`** CSS property sets the flex grow factor of a flex item's main size.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   */
  WebkitFlexGrow?: FlexGrow | undefined;
  /**
   * The **`flex-shrink`** CSS property sets the flex shrink factor of a flex item. If the size of all flex items is larger than the flex container, items shrink to fit according to `flex-shrink`.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `1`
   */
  WebkitFlexShrink?: FlexShrink | undefined;
  /**
   * The **`flex-wrap`** CSS property sets whether flex items are forced onto one line or can wrap onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked.
   * 
   * **Syntax**: `nowrap | wrap | wrap-reverse`
   * 
   * **Initial value**: `nowrap`
   */
  WebkitFlexWrap?: FlexWrap | undefined;
  /**
   * The **`font-feature-settings`** CSS property controls advanced typographic features in OpenType fonts.
   * 
   * **Syntax**: `normal | <feature-tag-value>#`
   * 
   * **Initial value**: `normal`
   */
  WebkitFontFeatureSettings?: FontFeatureSettings | undefined;
  /**
   * The **`font-kerning`** CSS property sets the use of the kerning information stored in a font.
   * 
   * **Syntax**: `auto | normal | none`
   * 
   * **Initial value**: `auto`
   */
  WebkitFontKerning?: FontKerning | undefined;
  /**
   * The **`font-smooth`** CSS property controls the application of anti-aliasing when fonts are rendered.
   * 
   * **Syntax**: `auto | never | always | <absolute-size> | <length>`
   * 
   * **Initial value**: `auto`
   */
  WebkitFontSmoothing?: FontSmooth<TLength> | undefined;
  /**
   * The **`font-variant-ligatures`** CSS property controls which ligatures and contextual forms are used in textual content of the elements it applies to. This leads to more harmonized forms in the resulting text.
   * 
   * **Syntax**: `normal | none | [ <common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> ]`
   * 
   * **Initial value**: `normal`
   */
  WebkitFontVariantLigatures?: FontVariantLigatures | undefined;
  /**
   * The **`hyphenate-character`** CSS property sets the character (or string) used at the end of a line before a hyphenation break.
   * 
   * **Syntax**: `auto | <string>`
   * 
   * **Initial value**: `auto`
   */
  WebkitHyphenateCharacter?: HyphenateCharacter | undefined;
  /**
   * The **`hyphens`** CSS property specifies how words should be hyphenated when text wraps across multiple lines. It can prevent hyphenation entirely, hyphenate at manually-specified points within the text, or let the browser automatically insert hyphens where appropriate.
   * 
   * **Syntax**: `none | manual | auto`
   * 
   * **Initial value**: `manual`
   */
  WebkitHyphens?: Hyphens | undefined;
  /**
   * The `initial-letter` CSS property sets styling for dropped, raised, and sunken initial letters.
   * 
   * **Syntax**: `normal | [ <number> <integer>? ]`
   * 
   * **Initial value**: `normal`
   */
  WebkitInitialLetter?: InitialLetter | undefined;
  /**
   * The CSS **`justify-content`** property defines how the browser distributes space between and around content items along the main-axis of a flex container, and the inline axis of a grid container.
   * 
   * **Syntax**: `normal | <content-distribution> | <overflow-position>? [ <content-position> | left | right ]`
   * 
   * **Initial value**: `normal`
   */
  WebkitJustifyContent?: JustifyContent | undefined;
  /**
   * The **`line-break`** CSS property sets how to break lines of Chinese, Japanese, or Korean (CJK) text when working with punctuation and symbols.
   * 
   * **Syntax**: `auto | loose | normal | strict | anywhere`
   * 
   * **Initial value**: `auto`
   */
  WebkitLineBreak?: LineBreak | undefined;
  /**
   * The **`-webkit-line-clamp`** CSS property allows limiting of the contents of a block container to the specified number of lines.
   * 
   * **Syntax**: `none | <integer>`
   * 
   * **Initial value**: `none`
   */
  WebkitLineClamp?: WebkitLineClamp | undefined;
  /**
   * The **`margin-inline-end`** CSS property defines the logical inline end margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation. In other words, it corresponds to the `margin-top`, `margin-right`, `margin-bottom` or `margin-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   */
  WebkitMarginEnd?: MarginInlineEnd<TLength> | undefined;
  /**
   * The **`margin-inline-start`** CSS property defines the logical inline start margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation. It corresponds to the `margin-top`, `margin-right`, `margin-bottom`, or `margin-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   */
  WebkitMarginStart?: MarginInlineStart<TLength> | undefined;
  /**
   * If a `-webkit-mask-image` is specified, `-webkit-mask-attachment` determines whether the mask image's position is fixed within the viewport, or scrolls along with its containing block.
   * 
   * **Syntax**: `<attachment>#`
   * 
   * **Initial value**: `scroll`
   */
  WebkitMaskAttachment?: WebkitMaskAttachment | undefined;
  /**
   * The **`mask-border-outset`** CSS property specifies the distance by which an element's mask border is set out from its border box.
   * 
   * **Syntax**: `[ <length> | <number> ]{1,4}`
   * 
   * **Initial value**: `0`
   */
  WebkitMaskBoxImageOutset?: MaskBorderOutset<TLength> | undefined;
  /**
   * The **`mask-border-repeat`** CSS property sets how the edge regions of a source image are adjusted to fit the dimensions of an element's mask border.
   * 
   * **Syntax**: `[ stretch | repeat | round | space ]{1,2}`
   * 
   * **Initial value**: `stretch`
   */
  WebkitMaskBoxImageRepeat?: MaskBorderRepeat | undefined;
  /**
   * The **`mask-border-slice`** CSS property divides the image set by `mask-border-source` into regions. These regions are used to form the components of an element's mask border.
   * 
   * **Syntax**: `<number-percentage>{1,4} fill?`
   * 
   * **Initial value**: `0`
   */
  WebkitMaskBoxImageSlice?: MaskBorderSlice | undefined;
  /**
   * The **`mask-border-source`** CSS property sets the source image used to create an element's mask border.
   * 
   * **Syntax**: `none | <image>`
   * 
   * **Initial value**: `none`
   */
  WebkitMaskBoxImageSource?: MaskBorderSource | undefined;
  /**
   * The **`mask-border-width`** CSS property sets the width of an element's mask border.
   * 
   * **Syntax**: `[ <length-percentage> | <number> | auto ]{1,4}`
   * 
   * **Initial value**: `auto`
   */
  WebkitMaskBoxImageWidth?: MaskBorderWidth<TLength> | undefined;
  /**
   * The **`mask-clip`** CSS property determines the area which is affected by a mask. The painted content of an element must be restricted to this area.
   * 
   * **Syntax**: `[ <box> | border | padding | content | text ]#`
   * 
   * **Initial value**: `border`
   */
  WebkitMaskClip?: WebkitMaskClip | undefined;
  /**
   * The **`-webkit-mask-composite`** property specifies the manner in which multiple mask images applied to the same element are composited with one another. Mask images are composited in the opposite order that they are declared with the `-webkit-mask-image` property.
   * 
   * **Syntax**: `<composite-style>#`
   * 
   * **Initial value**: `source-over`
   */
  WebkitMaskComposite?: WebkitMaskComposite | undefined;
  /**
   * The **`mask-image`** CSS property sets the image that is used as mask layer for an element. By default this means the alpha channel of the mask image will be multiplied with the alpha channel of the element. This can be controlled with the `mask-mode` property.
   * 
   * **Syntax**: `<mask-reference>#`
   * 
   * **Initial value**: `none`
   */
  WebkitMaskImage?: WebkitMaskImage | undefined;
  /**
   * The **`mask-origin`** CSS property sets the origin of a mask.
   * 
   * **Syntax**: `[ <box> | border | padding | content ]#`
   * 
   * **Initial value**: `padding`
   */
  WebkitMaskOrigin?: WebkitMaskOrigin | undefined;
  /**
   * The **`mask-position`** CSS property sets the initial position, relative to the mask position layer set by `mask-origin`, for each defined mask image.
   * 
   * **Syntax**: `<position>#`
   * 
   * **Initial value**: `0% 0%`
   */
  WebkitMaskPosition?: WebkitMaskPosition<TLength> | undefined;
  /**
   * The `-webkit-mask-position-x` CSS property sets the initial horizontal position of a mask image.
   * 
   * **Syntax**: `[ <length-percentage> | left | center | right ]#`
   * 
   * **Initial value**: `0%`
   */
  WebkitMaskPositionX?: WebkitMaskPositionX<TLength> | undefined;
  /**
   * The `-webkit-mask-position-y` CSS property sets the initial vertical position of a mask image.
   * 
   * **Syntax**: `[ <length-percentage> | top | center | bottom ]#`
   * 
   * **Initial value**: `0%`
   */
  WebkitMaskPositionY?: WebkitMaskPositionY<TLength> | undefined;
  /**
   * The **`mask-repeat`** CSS property sets how mask images are repeated. A mask image can be repeated along the horizontal axis, the vertical axis, both axes, or not repeated at all.
   * 
   * **Syntax**: `<repeat-style>#`
   * 
   * **Initial value**: `repeat`
   */
  WebkitMaskRepeat?: WebkitMaskRepeat | undefined;
  /**
   * The `-webkit-mask-repeat-x` property specifies whether and how a mask image is repeated (tiled) horizontally.
   * 
   * **Syntax**: `repeat | no-repeat | space | round`
   * 
   * **Initial value**: `repeat`
   */
  WebkitMaskRepeatX?: WebkitMaskRepeatX | undefined;
  /**
   * The `-webkit-mask-repeat-y` property sets whether and how a mask image is repeated (tiled) vertically.
   * 
   * **Syntax**: `repeat | no-repeat | space | round`
   * 
   * **Initial value**: `repeat`
   */
  WebkitMaskRepeatY?: WebkitMaskRepeatY | undefined;
  /**
   * The **`mask-size`** CSS property specifies the sizes of the mask images. The size of the image can be fully or partially constrained in order to preserve its intrinsic ratio.
   * 
   * **Syntax**: `<bg-size>#`
   * 
   * **Initial value**: `auto auto`
   */
  WebkitMaskSize?: WebkitMaskSize<TLength> | undefined;
  /**
   * The **`max-inline-size`** CSS property defines the horizontal or vertical maximum size of an element's block, depending on its writing mode. It corresponds to either the `max-width` or the `max-height` property, depending on the value of `writing-mode`.
   * 
   * **Syntax**: `<'max-width'>`
   * 
   * **Initial value**: `none`
   */
  WebkitMaxInlineSize?: MaxInlineSize<TLength> | undefined;
  /**
   * The **`order`** CSS property sets the order to lay out an item in a flex or grid container. Items in a container are sorted by ascending `order` value and then by their source code order.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `0`
   */
  WebkitOrder?: Order | undefined;
  /**
   * The `-webkit-overflow-scrolling` CSS property controls whether or not touch devices use momentum-based scrolling for a given element.
   * 
   * **Syntax**: `auto | touch`
   * 
   * **Initial value**: `auto`
   */
  WebkitOverflowScrolling?: WebkitOverflowScrolling | undefined;
  /**
   * The **`padding-inline-end`** CSS property defines the logical inline end padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   */
  WebkitPaddingEnd?: PaddingInlineEnd<TLength> | undefined;
  /**
   * The **`padding-inline-start`** CSS property defines the logical inline start padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   */
  WebkitPaddingStart?: PaddingInlineStart<TLength> | undefined;
  /**
   * The **`perspective`** CSS property determines the distance between the z=0 plane and the user in order to give a 3D-positioned element some perspective.
   * 
   * **Syntax**: `none | <length>`
   * 
   * **Initial value**: `none`
   */
  WebkitPerspective?: Perspective<TLength> | undefined;
  /**
   * The **`perspective-origin`** CSS property determines the position at which the viewer is looking. It is used as the _vanishing point_ by the `perspective` property.
   * 
   * **Syntax**: `<position>`
   * 
   * **Initial value**: `50% 50%`
   */
  WebkitPerspectiveOrigin?: PerspectiveOrigin<TLength> | undefined;
  /**
   * The **`print-color-adjust`** CSS property sets what, if anything, the user agent may do to optimize the appearance of the element on the output device. By default, the browser is allowed to make any adjustments to the element's appearance it determines to be necessary and prudent given the type and capabilities of the output device.
   * 
   * **Syntax**: `economy | exact`
   * 
   * **Initial value**: `economy`
   */
  WebkitPrintColorAdjust?: PrintColorAdjust | undefined;
  /**
   * The **`ruby-position`** CSS property defines the position of a ruby element relatives to its base element. It can be positioned over the element (`over`), under it (`under`), or between the characters on their right side (`inter-character`).
   * 
   * **Syntax**: `[ alternate || [ over | under ] ] | inter-character`
   * 
   * **Initial value**: `alternate`
   */
  WebkitRubyPosition?: RubyPosition | undefined;
  /**
   * The **`scroll-snap-type`** CSS property sets how strictly snap points are enforced on the scroll container in case there is one.
   * 
   * **Syntax**: `none | [ x | y | block | inline | both ] [ mandatory | proximity ]?`
   * 
   * **Initial value**: `none`
   */
  WebkitScrollSnapType?: ScrollSnapType | undefined;
  /**
   * The **`shape-margin`** CSS property sets a margin for a CSS shape created using `shape-outside`.
   * 
   * **Syntax**: `<length-percentage>`
   * 
   * **Initial value**: `0`
   */
  WebkitShapeMargin?: ShapeMargin<TLength> | undefined;
  /**
   * **`-webkit-tap-highlight-color`** is a non-standard CSS property that sets the color of the highlight that appears over a link while it's being tapped. The highlighting indicates to the user that their tap is being successfully recognized, and indicates which element they're tapping on.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `black`
   */
  WebkitTapHighlightColor?: WebkitTapHighlightColor | undefined;
  /**
   * The **`text-combine-upright`** CSS property sets the combination of characters into the space of a single character. If the combined text is wider than 1em, the user agent must fit the contents within 1em. The resulting composition is treated as a single upright glyph for layout and decoration. This property only has an effect in vertical writing modes.
   * 
   * **Syntax**: `none | all | [ digits <integer>? ]`
   * 
   * **Initial value**: `none`
   */
  WebkitTextCombine?: TextCombineUpright | undefined;
  /**
   * The **`text-decoration-color`** CSS property sets the color of decorations added to text by `text-decoration-line`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  WebkitTextDecorationColor?: TextDecorationColor | undefined;
  /**
   * The **`text-decoration-line`** CSS property sets the kind of decoration that is used on text in an element, such as an underline or overline.
   * 
   * **Syntax**: `none | [ underline || overline || line-through || blink ] | spelling-error | grammar-error`
   * 
   * **Initial value**: `none`
   */
  WebkitTextDecorationLine?: TextDecorationLine | undefined;
  /**
   * The **`text-decoration-skip`** CSS property sets what parts of an element's content any text decoration affecting the element must skip over. It controls all text decoration lines drawn by the element and also any text decoration lines drawn by its ancestors.
   * 
   * **Syntax**: `none | [ objects || [ spaces | [ leading-spaces || trailing-spaces ] ] || edges || box-decoration ]`
   * 
   * **Initial value**: `objects`
   */
  WebkitTextDecorationSkip?: TextDecorationSkip | undefined;
  /**
   * The **`text-decoration-style`** CSS property sets the style of the lines specified by `text-decoration-line`. The style applies to all lines that are set with `text-decoration-line`.
   * 
   * **Syntax**: `solid | double | dotted | dashed | wavy`
   * 
   * **Initial value**: `solid`
   */
  WebkitTextDecorationStyle?: TextDecorationStyle | undefined;
  /**
   * The **`text-emphasis-color`** CSS property sets the color of emphasis marks. This value can also be set using the `text-emphasis` shorthand.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  WebkitTextEmphasisColor?: TextEmphasisColor | undefined;
  /**
   * The **`text-emphasis-position`** CSS property sets where emphasis marks are drawn. Like ruby text, if there isn't enough room for emphasis marks, the line height is increased.
   * 
   * **Syntax**: `[ over | under ] && [ right | left ]`
   * 
   * **Initial value**: `over right`
   */
  WebkitTextEmphasisPosition?: TextEmphasisPosition | undefined;
  /**
   * The **`text-emphasis-style`** CSS property sets the appearance of emphasis marks. It can also be set, and reset, using the `text-emphasis` shorthand.
   * 
   * **Syntax**: `none | [ [ filled | open ] || [ dot | circle | double-circle | triangle | sesame ] ] | <string>`
   * 
   * **Initial value**: `none`
   */
  WebkitTextEmphasisStyle?: TextEmphasisStyle | undefined;
  /**
   * The **`-webkit-text-fill-color`** CSS property specifies the fill color of characters of text. If this property is not set, the value of the `color` property is used.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  WebkitTextFillColor?: WebkitTextFillColor | undefined;
  /**
   * The **`text-orientation`** CSS property sets the orientation of the text characters in a line. It only affects text in vertical mode (when `writing-mode` is not `horizontal-tb`). It is useful for controlling the display of languages that use vertical script, and also for making vertical table headers.
   * 
   * **Syntax**: `mixed | upright | sideways`
   * 
   * **Initial value**: `mixed`
   */
  WebkitTextOrientation?: TextOrientation | undefined;
  /**
   * The **`text-size-adjust`** CSS property controls the text inflation algorithm used on some smartphones and tablets. Other browsers will ignore this property.
   * 
   * **Syntax**: `none | auto | <percentage>`
   * 
   * **Initial value**: `auto` for smartphone browsers supporting inflation, `none` in other cases (and then not modifiable).
   */
  WebkitTextSizeAdjust?: TextSizeAdjust | undefined;
  /**
   * The **`-webkit-text-stroke-color`** CSS property specifies the stroke color of characters of text. If this property is not set, the value of the `color` property is used.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  WebkitTextStrokeColor?: WebkitTextStrokeColor | undefined;
  /**
   * The **`-webkit-text-stroke-width`** CSS property specifies the width of the stroke for text.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   */
  WebkitTextStrokeWidth?: WebkitTextStrokeWidth<TLength> | undefined;
  /**
   * The **`text-underline-position`** CSS property specifies the position of the underline which is set using the `text-decoration` property's `underline` value.
   * 
   * **Syntax**: `auto | from-font | [ under || [ left | right ] ]`
   * 
   * **Initial value**: `auto`
   */
  WebkitTextUnderlinePosition?: TextUnderlinePosition | undefined;
  /**
   * The `-webkit-touch-callout` CSS property controls the display of the default callout shown when you touch and hold a touch target.
   * 
   * **Syntax**: `default | none`
   * 
   * **Initial value**: `default`
   */
  WebkitTouchCallout?: WebkitTouchCallout | undefined;
  /**
   * The **`transform`** CSS property lets you rotate, scale, skew, or translate an element. It modifies the coordinate space of the CSS visual formatting model.
   * 
   * **Syntax**: `none | <transform-list>`
   * 
   * **Initial value**: `none`
   */
  WebkitTransform?: Transform | undefined;
  /**
   * The **`transform-origin`** CSS property sets the origin for an element's transformations.
   * 
   * **Syntax**: `[ <length-percentage> | left | center | right | top | bottom ] | [ [ <length-percentage> | left | center | right ] && [ <length-percentage> | top | center | bottom ] ] <length>?`
   * 
   * **Initial value**: `50% 50% 0`
   */
  WebkitTransformOrigin?: TransformOrigin<TLength> | undefined;
  /**
   * The **`transform-style`** CSS property sets whether children of an element are positioned in the 3D space or are flattened in the plane of the element.
   * 
   * **Syntax**: `flat | preserve-3d`
   * 
   * **Initial value**: `flat`
   */
  WebkitTransformStyle?: TransformStyle | undefined;
  /**
   * The **`transition-delay`** CSS property specifies the duration to wait before starting a property's transition effect when its value changes.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  WebkitTransitionDelay?: TransitionDelay<TTime> | undefined;
  /**
   * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  WebkitTransitionDuration?: TransitionDuration<TTime> | undefined;
  /**
   * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
   * 
   * **Syntax**: `none | <single-transition-property>#`
   * 
   * **Initial value**: all
   */
  WebkitTransitionProperty?: TransitionProperty | undefined;
  /**
   * The **`transition-timing-function`** CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   */
  WebkitTransitionTimingFunction?: TransitionTimingFunction | undefined;
  /**
   * **Syntax**: `read-only | read-write | read-write-plaintext-only`
   * 
   * **Initial value**: `read-only`
   */
  WebkitUserModify?: WebkitUserModify | undefined;
  /**
   * The **`user-select`** CSS property controls whether the user can select text. This doesn't have any effect on content loaded as part of a browser's user interface (its chrome), except in textboxes.
   * 
   * **Syntax**: `auto | text | none | contain | all`
   * 
   * **Initial value**: `auto`
   */
  WebkitUserSelect?: UserSelect | undefined;
  /**
   * The **`writing-mode`** CSS property sets whether lines of text are laid out horizontally or vertically, as well as the direction in which blocks progress. When set for an entire document, it should be set on the root element (`html` element for HTML documents).
   * 
   * **Syntax**: `horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr`
   * 
   * **Initial value**: `horizontal-tb`
   */
  WebkitWritingMode?: WritingMode | undefined;
}

export interface VendorShorthandProperties<TLength = (string & {}) | 0, TTime = string & {}> {
  /**
   * The **`animation`** shorthand CSS property applies an animation between styles. It is a shorthand for `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`, and `animation-play-state`.
   * 
   * **Syntax**: `<single-animation>#`
   */
  MozAnimation?: Animation<TTime> | undefined;
  /**
   * The **`border-image`** CSS property draws an image around a given element. It replaces the element's regular border.
   * 
   * **Syntax**: `<'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>`
   */
  MozBorderImage?: BorderImage | undefined;
  /**
   * The **`column-rule`** shorthand CSS property sets the width, style, and color of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>`
   */
  MozColumnRule?: ColumnRule<TLength> | undefined;
  /**
   * The **`columns`** CSS shorthand property sets the number of columns to use when drawing an element's contents, as well as those columns' widths.
   * 
   * **Syntax**: `<'column-width'> || <'column-count'>`
   */
  MozColumns?: Columns<TLength> | undefined;
  /**
   * The **`transition`** CSS property is a shorthand property for `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.
   * 
   * **Syntax**: `<single-transition>#`
   */
  MozTransition?: Transition<TTime> | undefined;
  /**
   * The **`-ms-content-zoom-limit`** CSS shorthand property is a Microsoft extension that specifies values for the `-ms-content-zoom-limit-min` and `-ms-content-zoom-limit-max` properties.
   * 
   * **Syntax**: `<'-ms-content-zoom-limit-min'> <'-ms-content-zoom-limit-max'>`
   */
  msContentZoomLimit?: MsContentZoomLimit | undefined;
  /**
   * The **`-ms-content-zoom-snap`** CSS shorthand property is a Microsoft extension that specifies values for the `-ms-content-zoom-snap-type` and `-ms-content-zoom-snap-points` properties.
   * 
   * **Syntax**: `<'-ms-content-zoom-snap-type'> || <'-ms-content-zoom-snap-points'>`
   */
  msContentZoomSnap?: MsContentZoomSnap | undefined;
  /**
   * The **`flex`** CSS shorthand property sets how a flex _item_ will grow or shrink to fit the space available in its flex container.
   * 
   * **Syntax**: `none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]`
   */
  msFlex?: Flex<TLength> | undefined;
  /**
   * The **\-ms-scroll-limit** CSS property is a Microsoft extension that specifies values for the `-ms-scroll-limit-x-min`, `-ms-scroll-limit-y-min`, `-ms-scroll-limit-x-max`, and `-ms-scroll-limit-y-max` properties.
   * 
   * **Syntax**: `<'-ms-scroll-limit-x-min'> <'-ms-scroll-limit-y-min'> <'-ms-scroll-limit-x-max'> <'-ms-scroll-limit-y-max'>`
   */
  msScrollLimit?: MsScrollLimit | undefined;
  /**
   * The **`-ms-scroll-snap-x`** CSS shorthand property is a Microsoft extension that specifies values for the `-ms-scroll-snap-type` and `-ms-scroll-snap-points-x` properties.
   * 
   * **Syntax**: `<'-ms-scroll-snap-type'> <'-ms-scroll-snap-points-x'>`
   */
  msScrollSnapX?: MsScrollSnapX | undefined;
  /**
   * The **`-ms-scroll-snap-x`** CSS shorthand property is a Microsoft extension that specifies values for the `-ms-scroll-snap-type` and `-ms-scroll-snap-points-y` properties.
   * 
   * **Syntax**: `<'-ms-scroll-snap-type'> <'-ms-scroll-snap-points-y'>`
   */
  msScrollSnapY?: MsScrollSnapY | undefined;
  /**
   * The **`transition`** CSS property is a shorthand property for `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.
   * 
   * **Syntax**: `<single-transition>#`
   */
  msTransition?: Transition<TTime> | undefined;
  /**
   * The **`animation`** shorthand CSS property applies an animation between styles. It is a shorthand for `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`, and `animation-play-state`.
   * 
   * **Syntax**: `<single-animation>#`
   */
  WebkitAnimation?: Animation<TTime> | undefined;
  /**
   * The **`-webkit-border-before`** CSS property is a shorthand property for setting the individual logical block start border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-width'> || <'border-style'> || <color>`
   */
  WebkitBorderBefore?: WebkitBorderBefore<TLength> | undefined;
  /**
   * The **`border-image`** CSS property draws an image around a given element. It replaces the element's regular border.
   * 
   * **Syntax**: `<'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>`
   */
  WebkitBorderImage?: BorderImage | undefined;
  /**
   * The **`border-radius`** CSS property rounds the corners of an element's outer border edge. You can set a single radius to make circular corners, or two radii to make elliptical corners.
   * 
   * **Syntax**: `<length-percentage>{1,4} [ / <length-percentage>{1,4} ]?`
   */
  WebkitBorderRadius?: BorderRadius<TLength> | undefined;
  /**
   * The **`column-rule`** shorthand CSS property sets the width, style, and color of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>`
   */
  WebkitColumnRule?: ColumnRule<TLength> | undefined;
  /**
   * The **`columns`** CSS shorthand property sets the number of columns to use when drawing an element's contents, as well as those columns' widths.
   * 
   * **Syntax**: `<'column-width'> || <'column-count'>`
   */
  WebkitColumns?: Columns<TLength> | undefined;
  /**
   * The **`flex`** CSS shorthand property sets how a flex _item_ will grow or shrink to fit the space available in its flex container.
   * 
   * **Syntax**: `none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]`
   */
  WebkitFlex?: Flex<TLength> | undefined;
  /**
   * The **`flex-flow`** CSS shorthand property specifies the direction of a flex container, as well as its wrapping behavior.
   * 
   * **Syntax**: `<'flex-direction'> || <'flex-wrap'>`
   */
  WebkitFlexFlow?: FlexFlow | undefined;
  /**
   * The **`mask`** CSS shorthand property hides an element (partially or fully) by masking or clipping the image at specific points.
   * 
   * **Syntax**: `[ <mask-reference> || <position> [ / <bg-size> ]? || <repeat-style> || [ <box> | border | padding | content | text ] || [ <box> | border | padding | content ] ]#`
   */
  WebkitMask?: WebkitMask<TLength> | undefined;
  /**
   * The **`mask-border`** CSS shorthand property lets you create a mask along the edge of an element's border.
   * 
   * **Syntax**: `<'mask-border-source'> || <'mask-border-slice'> [ / <'mask-border-width'>? [ / <'mask-border-outset'> ]? ]? || <'mask-border-repeat'> || <'mask-border-mode'>`
   */
  WebkitMaskBoxImage?: MaskBorder | undefined;
  /**
   * The **`text-emphasis`** CSS property applies emphasis marks to text (except spaces and control characters). It is a shorthand for `text-emphasis-style` and `text-emphasis-color`.
   * 
   * **Syntax**: `<'text-emphasis-style'> || <'text-emphasis-color'>`
   */
  WebkitTextEmphasis?: TextEmphasis | undefined;
  /**
   * The **`-webkit-text-stroke`** CSS property specifies the width and color of strokes for text characters. This is a shorthand property for the longhand properties `-webkit-text-stroke-width` and `-webkit-text-stroke-color`.
   * 
   * **Syntax**: `<length> || <color>`
   */
  WebkitTextStroke?: WebkitTextStroke<TLength> | undefined;
  /**
   * The **`transition`** CSS property is a shorthand property for `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.
   * 
   * **Syntax**: `<single-transition>#`
   */
  WebkitTransition?: Transition<TTime> | undefined;
}

export type Azimuth = Globals | "behind" | "center" | "center-left" | "center-right" | "far-left" | "far-right" | "left" | "left-side" | "leftwards" | "right" | "right-side" | "rightwards" | (string & {});

export type BoxAlign = Globals | "baseline" | "center" | "end" | "start" | "stretch";

export type BoxDirection = Globals | "inherit" | "normal" | "reverse";

export type BoxFlex = Globals | (number & {}) | (string & {});

export type BoxFlexGroup = Globals | (number & {}) | (string & {});

export type BoxLines = Globals | "multiple" | "single";

export type BoxOrdinalGroup = Globals | (number & {}) | (string & {});

export type BoxOrient = Globals | "block-axis" | "horizontal" | "inherit" | "inline-axis" | "vertical";

export type BoxPack = Globals | "center" | "end" | "justify" | "start";

export type Clip = Globals | "auto" | (string & {});

export type GridColumnGap<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type GridGap<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type GridRowGap<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type ImeMode = Globals | "active" | "auto" | "disabled" | "inactive" | "normal";

export type InsetBlock<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type InsetBlockEnd<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type InsetBlockStart<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type InsetInline<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type InsetInlineEnd<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type InsetInlineStart<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type ScrollSnapCoordinate<TLength = (string & {}) | 0> = Globals | Position___1<TLength> | "none" | (string & {});

export type ScrollSnapDestination<TLength = (string & {}) | 0> = Globals | Position___1<TLength>;

export type ScrollSnapPointsX = Globals | "none" | (string & {});

export type ScrollSnapPointsY = Globals | "none" | (string & {});

export type ScrollSnapTypeX = Globals | "mandatory" | "none" | "proximity";

export type ScrollSnapTypeY = Globals | "mandatory" | "none" | "proximity";

export type LineBreak = Globals | "anywhere" | "auto" | "loose" | "normal" | "strict";

export type Opacity = Globals | (string & {}) | (number & {});

export type UserSelect = Globals | "-moz-none" | "all" | "auto" | "contain" | "element" | "none" | "text";

export type BackgroundClip = Globals | Box | (string & {});

export type BoxDecorationBreak = Globals | "clone" | "slice";

export type BackgroundOrigin = Globals | Box | (string & {});

export type BackgroundSize<TLength = (string & {}) | 0> = Globals | BgSize<TLength> | (string & {});

export type MozBinding = Globals | "none" | (string & {});

export type BorderRadius<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type BorderBottomLeftRadius<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type BorderBottomRightRadius<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type BorderTopLeftRadius<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type BorderTopRightRadius<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type BoxShadow = Globals | "none" | (string & {});

export type MozFloatEdge = Globals | "border-box" | "content-box" | "margin-box" | "padding-box";

export type MozForceBrokenImageIcon = Globals | 0 | (string & {}) | 1;

export type Outline<TLength = (string & {}) | 0> = Globals | Color___1 | LineStyle | LineWidth<TLength> | "auto" | "invert" | (string & {});

export type OutlineColor = Globals | Color___1 | "invert";

export type MozOutlineRadius<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type MozOutlineRadiusBottomleft<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type MozOutlineRadiusBottomright<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type MozOutlineRadiusTopleft<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type MozOutlineRadiusTopright<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type OutlineStyle = Globals | LineStyle | "auto" | (string & {});

export type OutlineWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength>;

export type TextAlignLast = Globals | "auto" | "center" | "end" | "justify" | "left" | "right" | "start";

export type TextDecorationColor = Globals | Color___1;

export type TextDecorationLine = Globals | "blink" | "grammar-error" | "line-through" | "none" | "overline" | "spelling-error" | "underline" | (string & {});

export type TextDecorationStyle = Globals | "dashed" | "dotted" | "double" | "solid" | "wavy";

export type MozUserInput = Globals | "auto" | "disabled" | "enabled" | "none";

export type Animation<TTime = string & {}> = Globals | SingleAnimation<TTime> | (string & {});

export type AnimationDelay<TTime = string & {}> = Globals | TTime | (string & {});

export type AnimationDirection = Globals | SingleAnimationDirection | (string & {});

export type AnimationDuration<TTime = string & {}> = Globals | TTime | (string & {});

export type AnimationFillMode = Globals | SingleAnimationFillMode | (string & {});

export type AnimationIterationCount = Globals | "infinite" | (string & {}) | (number & {});

export type AnimationName = Globals | "none" | (string & {});

export type AnimationPlayState = Globals | "paused" | "running" | (string & {});

export type AnimationTimingFunction = Globals | EasingFunction | (string & {});

export type BorderImage = Globals | "none" | "repeat" | "round" | "space" | "stretch" | (string & {}) | (number & {});

export type ObjectFit = Globals | "contain" | "cover" | "fill" | "none" | "scale-down";

export type ObjectPosition<TLength = (string & {}) | 0> = Globals | Position___1<TLength>;

export type TabSize<TLength = (string & {}) | 0> = Globals | TLength | (number & {}) | (string & {});

export type TextOverflow = Globals | "clip" | "ellipsis" | (string & {});

export type Transform = Globals | "none" | (string & {});

export type TransformOrigin<TLength = (string & {}) | 0> = Globals | TLength | "bottom" | "center" | "left" | "right" | "top" | (string & {});

export type Transition<TTime = string & {}> = Globals | SingleTransition<TTime> | (string & {});

export type TransitionDelay<TTime = string & {}> = Globals | TTime | (string & {});

export type TransitionDuration<TTime = string & {}> = Globals | TTime | (string & {});

export type TransitionProperty = Globals | "all" | "none" | (string & {});

export type TransitionTimingFunction = Globals | EasingFunction | (string & {});

export type AlignmentBaseline = Globals | "after-edge" | "alphabetic" | "auto" | "baseline" | "before-edge" | "central" | "hanging" | "ideographic" | "mathematical" | "middle" | "text-after-edge" | "text-before-edge";

export type BaselineShift<TLength = (string & {}) | 0> = Globals | TLength | "baseline" | "sub" | "super" | (string & {});

export type ClipPath = Globals | GeometryBox | "none" | (string & {});

export type ClipRule = Globals | "evenodd" | "nonzero";

export type Color = Globals | Color___1;

export type ColorInterpolation = Globals | "auto" | "linearRGB" | "sRGB";

export type ColorRendering = Globals | "auto" | "optimizeQuality" | "optimizeSpeed";

export type Cursor = Globals | "-moz-grab" | "-webkit-grab" | "alias" | "all-scroll" | "auto" | "cell" | "col-resize" | "context-menu" | "copy" | "crosshair" | "default" | "e-resize" | "ew-resize" | "grab" | "grabbing" | "help" | "move" | "n-resize" | "ne-resize" | "nesw-resize" | "no-drop" | "none" | "not-allowed" | "ns-resize" | "nw-resize" | "nwse-resize" | "pointer" | "progress" | "row-resize" | "s-resize" | "se-resize" | "sw-resize" | "text" | "vertical-text" | "w-resize" | "wait" | "zoom-in" | "zoom-out" | (string & {});

export type Direction = Globals | "ltr" | "rtl";

export type Display = Globals | DisplayOutside | DisplayInside | DisplayInternal | DisplayLegacy | "contents" | "list-item" | "none" | (string & {});

export type DominantBaseline = Globals | "alphabetic" | "auto" | "central" | "hanging" | "ideographic" | "mathematical" | "middle" | "no-change" | "reset-size" | "text-after-edge" | "text-before-edge" | "use-script";

export type Fill = Globals | Paint;

export type FillOpacity = Globals | (number & {}) | (string & {});

export type FillRule = Globals | "evenodd" | "nonzero";

export type Filter = Globals | "none" | (string & {});

export type FloodColor = Globals | Color___1 | "currentColor";

export type FloodOpacity = Globals | (number & {}) | (string & {});

export type Font = Globals | "caption" | "icon" | "menu" | "message-box" | "small-caption" | "status-bar" | (string & {});

export type FontFamily = Globals | GenericFamily | (string & {});

export type FontSize<TLength = (string & {}) | 0> = Globals | AbsoluteSize | TLength | "larger" | "smaller" | (string & {});

export type FontSizeAdjust = Globals | "from-font" | "none" | (string & {}) | (number & {});

export type FontStretch = Globals | FontStretchAbsolute;

export type FontStyle = Globals | "italic" | "normal" | "oblique" | (string & {});

export type FontVariant = Globals | EastAsianVariantValues | "all-petite-caps" | "all-small-caps" | "common-ligatures" | "contextual" | "diagonal-fractions" | "discretionary-ligatures" | "full-width" | "historical-forms" | "historical-ligatures" | "lining-nums" | "no-common-ligatures" | "no-contextual" | "no-discretionary-ligatures" | "no-historical-ligatures" | "none" | "normal" | "oldstyle-nums" | "ordinal" | "petite-caps" | "proportional-nums" | "proportional-width" | "ruby" | "slashed-zero" | "small-caps" | "stacked-fractions" | "tabular-nums" | "titling-caps" | "unicase" | (string & {});

export type FontWeight = Globals | FontWeightAbsolute | "bolder" | "lighter";

export type GlyphOrientationVertical = Globals | "auto" | (string & {}) | (number & {});

export type ImageRendering = Globals | "-moz-crisp-edges" | "-webkit-optimize-contrast" | "auto" | "crisp-edges" | "pixelated";

export type LetterSpacing<TLength = (string & {}) | 0> = Globals | TLength | "normal";

export type LightingColor = Globals | Color___1 | "currentColor";

export type LineHeight<TLength = (string & {}) | 0> = Globals | TLength | "normal" | (string & {}) | (number & {});

export type Marker = Globals | "none" | (string & {});

export type MarkerEnd = Globals | "none" | (string & {});

export type MarkerMid = Globals | "none" | (string & {});

export type MarkerStart = Globals | "none" | (string & {});

export type Mask<TLength = (string & {}) | 0> = Globals | MaskLayer<TLength> | (string & {});

export type Overflow = Globals | "-moz-hidden-unscrollable" | "auto" | "clip" | "hidden" | "scroll" | "visible" | (string & {});

export type PaintOrder = Globals | "fill" | "markers" | "normal" | "stroke" | (string & {});

export type PointerEvents = Globals | "all" | "auto" | "fill" | "inherit" | "none" | "painted" | "stroke" | "visible" | "visibleFill" | "visiblePainted" | "visibleStroke";

export type ShapeRendering = Globals | "auto" | "crispEdges" | "geometricPrecision" | "optimizeSpeed";

export type StopColor = Globals | Color___1 | "currentColor";

export type StopOpacity = Globals | (number & {}) | (string & {});

export type Stroke = Globals | Paint;

export type StrokeDasharray<TLength = (string & {}) | 0> = Globals | Dasharray<TLength> | "none";

export type StrokeDashoffset<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type StrokeLinecap = Globals | "butt" | "round" | "square";

export type StrokeLinejoin = Globals | "bevel" | "miter" | "round";

export type StrokeMiterlimit = Globals | (number & {}) | (string & {});

export type StrokeOpacity = Globals | (number & {}) | (string & {});

export type StrokeWidth<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type TextAnchor = Globals | "end" | "middle" | "start";

export type TextDecoration<TLength = (string & {}) | 0> = Globals | Color___1 | TLength | "auto" | "blink" | "dashed" | "dotted" | "double" | "from-font" | "grammar-error" | "line-through" | "none" | "overline" | "solid" | "spelling-error" | "underline" | "wavy" | (string & {});

export type TextRendering = Globals | "auto" | "geometricPrecision" | "optimizeLegibility" | "optimizeSpeed";

export type UnicodeBidi = Globals | "-moz-isolate" | "-moz-isolate-override" | "-moz-plaintext" | "-webkit-isolate" | "-webkit-isolate-override" | "-webkit-plaintext" | "bidi-override" | "embed" | "isolate" | "isolate-override" | "normal" | "plaintext";

export type VectorEffect = Globals | "non-scaling-stroke" | "none";

export type Visibility = Globals | "collapse" | "hidden" | "visible";

export type WhiteSpace = Globals | "-moz-pre-wrap" | "break-spaces" | "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap";

export type WordSpacing<TLength = (string & {}) | 0> = Globals | TLength | "normal";

export type WritingMode = Globals | "horizontal-tb" | "sideways-lr" | "sideways-rl" | "vertical-lr" | "vertical-rl";

export interface StandardLonghandPropertiesHyphen<TLength = (string & {}) | 0, TTime = string & {}> {
  /**
   * The **`accent-color`** CSS property sets the accent color for user-interface controls generated by some elements.
   * 
   * **Syntax**: `auto | <color>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **93** | **92**  | **15.4** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/accent-color
   */
  "accent-color"?: AccentColor | undefined;
  /**
   * The CSS **`align-content`** property sets the distribution of space between and around content items along a flexbox's cross-axis or a grid's block axis.
   * 
   * **Syntax**: `normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position>`
   * 
   * **Initial value**: `normal`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **28**  |  **9**  | **12** | **11** |
   * | 21 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/align-content
   */
  "align-content"?: AlignContent | undefined;
  /**
   * The CSS **`align-items`** property sets the `align-self` value on all direct children as a group. In Flexbox, it controls the alignment of items on the Cross Axis. In Grid Layout, it controls the alignment of items on the Block Axis within their grid area.
   * 
   * **Syntax**: `normal | stretch | <baseline-position> | [ <overflow-position>? <self-position> ]`
   * 
   * **Initial value**: `normal`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **20**  |  **9**  | **12** | **11** |
   * | 21 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/align-items
   */
  "align-items"?: AlignItems | undefined;
  /**
   * The **`align-self`** CSS property overrides a grid or flex item's `align-items` value. In Grid, it aligns the item inside the grid area. In Flexbox, it aligns the item on the cross axis.
   * 
   * **Syntax**: `auto | normal | stretch | <baseline-position> | <overflow-position>? <self-position>`
   * 
   * **Initial value**: `auto`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **20**  |  **9**  | **12** | **10** |
   * | 21 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/align-self
   */
  "align-self"?: AlignSelf | undefined;
  /**
   * The **`align-tracks`** CSS property sets the alignment in the masonry axis for grid containers that have masonry in their block axis.
   * 
   * **Syntax**: `[ normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position> ]#`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   |   n/a   |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/align-tracks
   */
  "align-tracks"?: AlignTracks | undefined;
  /**
   * The **`animation-composition`** CSS property specifies the composite operation to use when multiple animations affect the same property simultaneously.
   * 
   * **Syntax**: `<single-animation-composition>#`
   * 
   * **Initial value**: `replace`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   |   n/a   |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-composition
   */
  "animation-composition"?: AnimationComposition | undefined;
  /**
   * The **`animation-delay`** CSS property specifies the amount of time to wait from applying the animation to an element before beginning to perform the animation. The animation can start later, immediately from its beginning, or immediately and partway through the animation.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-delay
   */
  "animation-delay"?: AnimationDelay<TTime> | undefined;
  /**
   * The **`animation-direction`** CSS property sets whether an animation should play forward, backward, or alternate back and forth between playing the sequence forward and backward.
   * 
   * **Syntax**: `<single-animation-direction>#`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-direction
   */
  "animation-direction"?: AnimationDirection | undefined;
  /**
   * The **`animation-duration`** CSS property sets the length of time that an animation takes to complete one cycle.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-duration
   */
  "animation-duration"?: AnimationDuration<TTime> | undefined;
  /**
   * The **`animation-fill-mode`** CSS property sets how a CSS animation applies styles to its target before and after its execution.
   * 
   * **Syntax**: `<single-animation-fill-mode>#`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 5 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-fill-mode
   */
  "animation-fill-mode"?: AnimationFillMode | undefined;
  /**
   * The **`animation-iteration-count`** CSS property sets the number of times an animation sequence should be played before stopping.
   * 
   * **Syntax**: `<single-animation-iteration-count>#`
   * 
   * **Initial value**: `1`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-iteration-count
   */
  "animation-iteration-count"?: AnimationIterationCount | undefined;
  /**
   * The **`animation-name`** CSS property specifies the names of one or more `@keyframes` at-rules describing the animation or animations to apply to the element.
   * 
   * **Syntax**: `[ none | <keyframes-name> ]#`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-name
   */
  "animation-name"?: AnimationName | undefined;
  /**
   * The **`animation-play-state`** CSS property sets whether an animation is running or paused.
   * 
   * **Syntax**: `<single-animation-play-state>#`
   * 
   * **Initial value**: `running`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-play-state
   */
  "animation-play-state"?: AnimationPlayState | undefined;
  /**
   * The **`animation-timeline`** CSS property specifies the names of one or more `@scroll-timeline` at-rules describing the scroll animations to apply to the element.
   * 
   * **Syntax**: `<single-animation-timeline>#`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   |   n/a   |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-timeline
   */
  "animation-timeline"?: AnimationTimeline | undefined;
  /**
   * The **`animation-timing-function`** CSS property sets how an animation progresses through the duration of each cycle.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation-timing-function
   */
  "animation-timing-function"?: AnimationTimingFunction | undefined;
  /**
   * The **`appearance`** CSS property is used to display an element using platform-native styling, based on the operating system's theme. The **`-moz-appearance`** and **`-webkit-appearance`** properties are non-standard versions of this property, used (respectively) by Gecko (Firefox) and by WebKit-based (e.g., Safari) and Blink-based (e.g., Chrome, Opera) browsers to achieve the same thing. Note that Firefox and Edge also support **`-webkit-appearance`**, for compatibility reasons.
   * 
   * **Syntax**: `none | auto | textfield | menulist-button | <compat-auto>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox |  Safari  |   Edge   | IE  |
   * | :-----: | :-----: | :------: | :------: | :-: |
   * | **84**  | **80**  | **15.4** |  **84**  | No  |
   * | 1 _-x-_ | 1 _-x-_ | 3 _-x-_  | 12 _-x-_ |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/appearance
   */
  appearance?: Appearance | undefined;
  /**
   * The **`aspect-ratio`** CSS property sets a **preferred aspect ratio** for the box, which will be used in the calculation of auto sizes and some other layout functions.
   * 
   * **Syntax**: `auto | <ratio>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **88** | **89**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/aspect-ratio
   */
  "aspect-ratio"?: AspectRatio | undefined;
  /**
   * The **`backdrop-filter`** CSS property lets you apply graphical effects such as blurring or color shifting to the area behind an element. Because it applies to everything _behind_ the element, to see the effect you must make the element or its background at least partially transparent.
   * 
   * **Syntax**: `none | <filter-function-list>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |   Safari    |  Edge  | IE  |
   * | :----: | :-----: | :---------: | :----: | :-: |
   * | **76** | **103** | **9** _-x-_ | **17** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/backdrop-filter
   */
  "backdrop-filter"?: BackdropFilter | undefined;
  /**
   * The **`backface-visibility`** CSS property sets whether the back face of an element is visible when turned towards the user.
   * 
   * **Syntax**: `visible | hidden`
   * 
   * **Initial value**: `visible`
   * 
   * |  Chrome  | Firefox  |  Safari   |  Edge  |   IE   |
   * | :------: | :------: | :-------: | :----: | :----: |
   * |  **36**  |  **16**  | **15.4**  | **12** | **10** |
   * | 12 _-x-_ | 10 _-x-_ | 5.1 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/backface-visibility
   */
  "backface-visibility"?: BackfaceVisibility | undefined;
  /**
   * The **`background-attachment`** CSS property sets whether a background image's position is fixed within the viewport, or scrolls with its containing block.
   * 
   * **Syntax**: `<attachment>#`
   * 
   * **Initial value**: `scroll`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-attachment
   */
  "background-attachment"?: BackgroundAttachment | undefined;
  /**
   * The **`background-blend-mode`** CSS property sets how an element's background images should blend with each other and with the element's background color.
   * 
   * **Syntax**: `<blend-mode>#`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **35** | **30**  | **8**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-blend-mode
   */
  "background-blend-mode"?: BackgroundBlendMode | undefined;
  /**
   * The **`background-clip`** CSS property sets whether an element's background extends underneath its border box, padding box, or content box.
   * 
   * **Syntax**: `<box>#`
   * 
   * **Initial value**: `border-box`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **4**  | **14**  | **12** | **9** |
   * |        |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-clip
   */
  "background-clip"?: BackgroundClip | undefined;
  /**
   * The **`background-color`** CSS property sets the background color of an element.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `transparent`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-color
   */
  "background-color"?: BackgroundColor | undefined;
  /**
   * The **`background-image`** CSS property sets one or more background images on an element.
   * 
   * **Syntax**: `<bg-image>#`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-image
   */
  "background-image"?: BackgroundImage | undefined;
  /**
   * The **`background-origin`** CSS property sets the background's origin: from the border start, inside the border, or inside the padding.
   * 
   * **Syntax**: `<box>#`
   * 
   * **Initial value**: `padding-box`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **4**  | **3**  | **12** | **9** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-origin
   */
  "background-origin"?: BackgroundOrigin | undefined;
  /**
   * The **`background-position-x`** CSS property sets the initial horizontal position for each background image. The position is relative to the position layer set by `background-origin`.
   * 
   * **Syntax**: `[ center | [ [ left | right | x-start | x-end ]? <length-percentage>? ]! ]#`
   * 
   * **Initial value**: `0%`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  | **49**  | **1**  | **12** | **6** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-position-x
   */
  "background-position-x"?: BackgroundPositionX<TLength> | undefined;
  /**
   * The **`background-position-y`** CSS property sets the initial vertical position for each background image. The position is relative to the position layer set by `background-origin`.
   * 
   * **Syntax**: `[ center | [ [ top | bottom | y-start | y-end ]? <length-percentage>? ]! ]#`
   * 
   * **Initial value**: `0%`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  | **49**  | **1**  | **12** | **6** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-position-y
   */
  "background-position-y"?: BackgroundPositionY<TLength> | undefined;
  /**
   * The **`background-repeat`** CSS property sets how background images are repeated. A background image can be repeated along the horizontal and vertical axes, or not repeated at all.
   * 
   * **Syntax**: `<repeat-style>#`
   * 
   * **Initial value**: `repeat`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-repeat
   */
  "background-repeat"?: BackgroundRepeat | undefined;
  /**
   * The **`background-size`** CSS property sets the size of the element's background image. The image can be left to its natural size, stretched, or constrained to fit the available space.
   * 
   * **Syntax**: `<bg-size>#`
   * 
   * **Initial value**: `auto auto`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * |  **3**  |  **4**  |  **5**  | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-size
   */
  "background-size"?: BackgroundSize<TLength> | undefined;
  /**
   * **Syntax**: `clip | ellipsis | <string>`
   * 
   * **Initial value**: `clip`
   */
  "block-overflow"?: BlockOverflow | undefined;
  /**
   * The **`block-size`** CSS property defines the horizontal or vertical size of an element's block, depending on its writing mode. It corresponds to either the `width` or the `height` property, depending on the value of `writing-mode`.
   * 
   * **Syntax**: `<'width'>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/block-size
   */
  "block-size"?: BlockSize<TLength> | undefined;
  /**
   * The **`border-block-color`** CSS property defines the color of the logical block borders of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color` and `border-bottom-color`, or `border-right-color` and `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>{1,2}`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-color
   */
  "border-block-color"?: BorderBlockColor | undefined;
  /**
   * The **`border-block-end-color`** CSS property defines the color of the logical block-end border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-end-color
   */
  "border-block-end-color"?: BorderBlockEndColor | undefined;
  /**
   * The **`border-block-end-style`** CSS property defines the style of the logical block-end border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-end-style
   */
  "border-block-end-style"?: BorderBlockEndStyle | undefined;
  /**
   * The **`border-block-end-width`** CSS property defines the width of the logical block-end border of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width`, `border-right-width`, `border-bottom-width`, or `border-left-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-end-width
   */
  "border-block-end-width"?: BorderBlockEndWidth<TLength> | undefined;
  /**
   * The **`border-block-start-color`** CSS property defines the color of the logical block-start border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-start-color
   */
  "border-block-start-color"?: BorderBlockStartColor | undefined;
  /**
   * The **`border-block-start-style`** CSS property defines the style of the logical block start border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-start-style
   */
  "border-block-start-style"?: BorderBlockStartStyle | undefined;
  /**
   * The **`border-block-start-width`** CSS property defines the width of the logical block-start border of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width`, `border-right-width`, `border-bottom-width`, or `border-left-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-start-width
   */
  "border-block-start-width"?: BorderBlockStartWidth<TLength> | undefined;
  /**
   * The **`border-block-style`** CSS property defines the style of the logical block borders of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style` and `border-bottom-style`, or `border-left-style` and `border-right-style` properties depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-style
   */
  "border-block-style"?: BorderBlockStyle | undefined;
  /**
   * The **`border-block-width`** CSS property defines the width of the logical block borders of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width` and `border-bottom-width`, or `border-left-width`, and `border-right-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-width
   */
  "border-block-width"?: BorderBlockWidth<TLength> | undefined;
  /**
   * The **`border-bottom-color`** CSS property sets the color of an element's bottom border. It can also be set with the shorthand CSS properties `border-color` or `border-bottom`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-color
   */
  "border-bottom-color"?: BorderBottomColor | undefined;
  /**
   * The **`border-bottom-left-radius`** CSS property rounds the bottom-left corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * |  **4**  |  **4**  |  **5**  | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-left-radius
   */
  "border-bottom-left-radius"?: BorderBottomLeftRadius<TLength> | undefined;
  /**
   * The **`border-bottom-right-radius`** CSS property rounds the bottom-right corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * |  **4**  |  **4**  |  **5**  | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-right-radius
   */
  "border-bottom-right-radius"?: BorderBottomRightRadius<TLength> | undefined;
  /**
   * The **`border-bottom-style`** CSS property sets the line style of an element's bottom `border`.
   * 
   * **Syntax**: `<line-style>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-style
   */
  "border-bottom-style"?: BorderBottomStyle | undefined;
  /**
   * The **`border-bottom-width`** CSS property sets the width of the bottom border of an element.
   * 
   * **Syntax**: `<line-width>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-width
   */
  "border-bottom-width"?: BorderBottomWidth<TLength> | undefined;
  /**
   * The **`border-collapse`** CSS property sets whether cells inside a `<table>` have shared or separate borders.
   * 
   * **Syntax**: `collapse | separate`
   * 
   * **Initial value**: `separate`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **1**  | **1.2** | **12** | **5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-collapse
   */
  "border-collapse"?: BorderCollapse | undefined;
  /**
   * The **`border-end-end-radius`** CSS property defines a logical border radius on an element, which maps to a physical border radius that depends on the element's `writing-mode`, `direction`, and `text-orientation`. This is useful when building styles to work regardless of the text orientation and writing mode.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **89** | **66**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-end-end-radius
   */
  "border-end-end-radius"?: BorderEndEndRadius<TLength> | undefined;
  /**
   * The **`border-end-start-radius`** CSS property defines a logical border radius on an element, which maps to a physical border radius depending on the element's `writing-mode`, `direction`, and `text-orientation`. This is useful when building styles to work regardless of the text orientation and writing mode.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **89** | **66**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-end-start-radius
   */
  "border-end-start-radius"?: BorderEndStartRadius<TLength> | undefined;
  /**
   * The **`border-image-outset`** CSS property sets the distance by which an element's border image is set out from its border box.
   * 
   * **Syntax**: `[ <length> | <number> ]{1,4}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **15** | **15**  | **6**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-image-outset
   */
  "border-image-outset"?: BorderImageOutset<TLength> | undefined;
  /**
   * The **`border-image-repeat`** CSS property defines how the edge regions of a source image are adjusted to fit the dimensions of an element's border image.
   * 
   * **Syntax**: `[ stretch | repeat | round | space ]{1,2}`
   * 
   * **Initial value**: `stretch`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **15** | **15**  | **6**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-image-repeat
   */
  "border-image-repeat"?: BorderImageRepeat | undefined;
  /**
   * The **`border-image-slice`** CSS property divides the image specified by `border-image-source` into regions. These regions form the components of an element's border image.
   * 
   * **Syntax**: `<number-percentage>{1,4} && fill?`
   * 
   * **Initial value**: `100%`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **15** | **15**  | **6**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-image-slice
   */
  "border-image-slice"?: BorderImageSlice | undefined;
  /**
   * The **`border-image-source`** CSS property sets the source image used to create an element's border image.
   * 
   * **Syntax**: `none | <image>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **15** | **15**  | **6**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-image-source
   */
  "border-image-source"?: BorderImageSource | undefined;
  /**
   * The **`border-image-width`** CSS property sets the width of an element's border image.
   * 
   * **Syntax**: `[ <length-percentage> | <number> | auto ]{1,4}`
   * 
   * **Initial value**: `1`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **15** | **13**  | **6**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-image-width
   */
  "border-image-width"?: BorderImageWidth<TLength> | undefined;
  /**
   * The **`border-inline-color`** CSS property defines the color of the logical inline borders of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color` and `border-bottom-color`, or `border-right-color` and `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>{1,2}`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-color
   */
  "border-inline-color"?: BorderInlineColor | undefined;
  /**
   * The **`border-inline-end-color`** CSS property defines the color of the logical inline-end border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome |           Firefox           |  Safari  | Edge | IE  |
   * | :----: | :-------------------------: | :------: | :--: | :-: |
   * | **69** |           **41**            | **12.1** | n/a  | No  |
   * |        | 3 _(-moz-border-end-color)_ |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end-color
   */
  "border-inline-end-color"?: BorderInlineEndColor | undefined;
  /**
   * The **`border-inline-end-style`** CSS property defines the style of the logical inline end border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome |           Firefox           |  Safari  | Edge | IE  |
   * | :----: | :-------------------------: | :------: | :--: | :-: |
   * | **69** |           **41**            | **12.1** | n/a  | No  |
   * |        | 3 _(-moz-border-end-style)_ |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end-style
   */
  "border-inline-end-style"?: BorderInlineEndStyle | undefined;
  /**
   * The **`border-inline-end-width`** CSS property defines the width of the logical inline-end border of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width`, `border-right-width`, `border-bottom-width`, or `border-left-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome |           Firefox           |  Safari  | Edge | IE  |
   * | :----: | :-------------------------: | :------: | :--: | :-: |
   * | **69** |           **41**            | **12.1** | n/a  | No  |
   * |        | 3 _(-moz-border-end-width)_ |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end-width
   */
  "border-inline-end-width"?: BorderInlineEndWidth<TLength> | undefined;
  /**
   * The **`border-inline-start-color`** CSS property defines the color of the logical inline start border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome |            Firefox            |  Safari  | Edge | IE  |
   * | :----: | :---------------------------: | :------: | :--: | :-: |
   * | **69** |            **41**             | **12.1** | n/a  | No  |
   * |        | 3 _(-moz-border-start-color)_ |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-start-color
   */
  "border-inline-start-color"?: BorderInlineStartColor | undefined;
  /**
   * The **`border-inline-start-style`** CSS property defines the style of the logical inline start border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome |            Firefox            |  Safari  | Edge | IE  |
   * | :----: | :---------------------------: | :------: | :--: | :-: |
   * | **69** |            **41**             | **12.1** | n/a  | No  |
   * |        | 3 _(-moz-border-start-style)_ |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-start-style
   */
  "border-inline-start-style"?: BorderInlineStartStyle | undefined;
  /**
   * The **`border-inline-start-width`** CSS property defines the width of the logical inline-start border of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width`, `border-right-width`, `border-bottom-width`, or `border-left-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-start-width
   */
  "border-inline-start-width"?: BorderInlineStartWidth<TLength> | undefined;
  /**
   * The **`border-inline-style`** CSS property defines the style of the logical inline borders of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style` and `border-bottom-style`, or `border-left-style` and `border-right-style` properties depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-style
   */
  "border-inline-style"?: BorderInlineStyle | undefined;
  /**
   * The **`border-inline-width`** CSS property defines the width of the logical inline borders of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width` and `border-bottom-width`, or `border-left-width`, and `border-right-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-width
   */
  "border-inline-width"?: BorderInlineWidth<TLength> | undefined;
  /**
   * The **`border-left-color`** CSS property sets the color of an element's left border. It can also be set with the shorthand CSS properties `border-color` or `border-left`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-left-color
   */
  "border-left-color"?: BorderLeftColor | undefined;
  /**
   * The **`border-left-style`** CSS property sets the line style of an element's left `border`.
   * 
   * **Syntax**: `<line-style>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-left-style
   */
  "border-left-style"?: BorderLeftStyle | undefined;
  /**
   * The **`border-left-width`** CSS property sets the width of the left border of an element.
   * 
   * **Syntax**: `<line-width>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-left-width
   */
  "border-left-width"?: BorderLeftWidth<TLength> | undefined;
  /**
   * The **`border-right-color`** CSS property sets the color of an element's right border. It can also be set with the shorthand CSS properties `border-color` or `border-right`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-right-color
   */
  "border-right-color"?: BorderRightColor | undefined;
  /**
   * The **`border-right-style`** CSS property sets the line style of an element's right `border`.
   * 
   * **Syntax**: `<line-style>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-right-style
   */
  "border-right-style"?: BorderRightStyle | undefined;
  /**
   * The **`border-right-width`** CSS property sets the width of the right border of an element.
   * 
   * **Syntax**: `<line-width>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-right-width
   */
  "border-right-width"?: BorderRightWidth<TLength> | undefined;
  /**
   * The **`border-spacing`** CSS property sets the distance between the borders of adjacent `<table>` cells. This property applies only when `border-collapse` is `separate`.
   * 
   * **Syntax**: `<length> <length>?`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-spacing
   */
  "border-spacing"?: BorderSpacing<TLength> | undefined;
  /**
   * The **`border-start-end-radius`** CSS property defines a logical border radius on an element, which maps to a physical border radius depending on the element's `writing-mode`, `direction`, and `text-orientation`. This is useful when building styles to work regardless of the text orientation and writing mode.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **89** | **66**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-start-end-radius
   */
  "border-start-end-radius"?: BorderStartEndRadius<TLength> | undefined;
  /**
   * The **`border-start-start-radius`** CSS property defines a logical border radius on an element, which maps to a physical border radius that depends on the element's `writing-mode`, `direction`, and `text-orientation`. This is useful when building styles to work regardless of the text orientation and writing mode.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **89** | **66**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-start-start-radius
   */
  "border-start-start-radius"?: BorderStartStartRadius<TLength> | undefined;
  /**
   * The **`border-top-color`** CSS property sets the color of an element's top border. It can also be set with the shorthand CSS properties `border-color` or `border-top`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-top-color
   */
  "border-top-color"?: BorderTopColor | undefined;
  /**
   * The **`border-top-left-radius`** CSS property rounds the top-left corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * |  **4**  |  **4**  |  **5**  | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-top-left-radius
   */
  "border-top-left-radius"?: BorderTopLeftRadius<TLength> | undefined;
  /**
   * The **`border-top-right-radius`** CSS property rounds the top-right corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * |  **4**  |  **4**  |  **5**  | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-top-right-radius
   */
  "border-top-right-radius"?: BorderTopRightRadius<TLength> | undefined;
  /**
   * The **`border-top-style`** CSS property sets the line style of an element's top `border`.
   * 
   * **Syntax**: `<line-style>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-top-style
   */
  "border-top-style"?: BorderTopStyle | undefined;
  /**
   * The **`border-top-width`** CSS property sets the width of the top border of an element.
   * 
   * **Syntax**: `<line-width>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-top-width
   */
  "border-top-width"?: BorderTopWidth<TLength> | undefined;
  /**
   * The **`bottom`** CSS property participates in setting the vertical position of a positioned element. It has no effect on non-positioned elements.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/bottom
   */
  bottom?: Bottom<TLength> | undefined;
  /**
   * The **`box-decoration-break`** CSS property specifies how an element's fragments should be rendered when broken across multiple lines, columns, or pages.
   * 
   * **Syntax**: `slice | clone`
   * 
   * **Initial value**: `slice`
   * 
   * |    Chrome    | Firefox |   Safari    | Edge | IE  |
   * | :----------: | :-----: | :---------: | :--: | :-: |
   * | **22** _-x-_ | **32**  | **7** _-x-_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/box-decoration-break
   */
  "box-decoration-break"?: BoxDecorationBreak | undefined;
  /**
   * The **`box-shadow`** CSS property adds shadow effects around an element's frame. You can set multiple effects separated by commas. A box shadow is described by X and Y offsets relative to the element, blur and spread radius, and color.
   * 
   * **Syntax**: `none | <shadow>#`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * | **10**  |  **4**  | **5.1** | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/box-shadow
   */
  "box-shadow"?: BoxShadow | undefined;
  /**
   * The **`box-sizing`** CSS property sets how the total width and height of an element is calculated.
   * 
   * **Syntax**: `content-box | border-box`
   * 
   * **Initial value**: `content-box`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * | **10**  | **29**  | **5.1** | **12** | **8** |
   * | 1 _-x-_ | 1 _-x-_ | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/box-sizing
   */
  "box-sizing"?: BoxSizing | undefined;
  /**
   * The **`break-after`** CSS property sets how page, column, or region breaks should behave after a generated box. If there is no generated box, the property is ignored.
   * 
   * **Syntax**: `auto | avoid | always | all | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **50** | **65**  | **10** | **12** | **10** |
   * @see https://developer.mozilla.org/docs/Web/CSS/break-after
   */
  "break-after"?: BreakAfter | undefined;
  /**
   * The **`break-before`** CSS property sets how page, column, or region breaks should behave before a generated box. If there is no generated box, the property is ignored.
   * 
   * **Syntax**: `auto | avoid | always | all | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **50** | **65**  | **10** | **12** | **10** |
   * @see https://developer.mozilla.org/docs/Web/CSS/break-before
   */
  "break-before"?: BreakBefore | undefined;
  /**
   * The **`break-inside`** CSS property sets how page, column, or region breaks should behave inside a generated box. If there is no generated box, the property is ignored.
   * 
   * **Syntax**: `auto | avoid | avoid-page | avoid-column | avoid-region`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **50** | **65**  | **10** | **12** | **10** |
   * @see https://developer.mozilla.org/docs/Web/CSS/break-inside
   */
  "break-inside"?: BreakInside | undefined;
  /**
   * The **`caption-side`** CSS property puts the content of a table's `<caption>` on the specified side. The values are relative to the `writing-mode` of the table.
   * 
   * **Syntax**: `top | bottom | block-start | block-end | inline-start | inline-end`
   * 
   * **Initial value**: `top`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/caption-side
   */
  "caption-side"?: CaptionSide | undefined;
  /**
   * The **`caret-color`** CSS property sets the color of the **insertion caret**, the visible marker where the next character typed will be inserted. This is sometimes referred to as the **text input cursor**. The caret appears in elements such as `<input>` or those with the `contenteditable` attribute. The caret is typically a thin vertical line that flashes to help make it more noticeable. By default, it is black, but its color can be altered with this property.
   * 
   * **Syntax**: `auto | <color>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **53**  | **11.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/caret-color
   */
  "caret-color"?: CaretColor | undefined;
  /**
   * The **`clear`** CSS property sets whether an element must be moved below (cleared) floating elements that precede it. The `clear` property applies to floating and non-floating elements.
   * 
   * **Syntax**: `none | left | right | both | inline-start | inline-end`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/clear
   */
  clear?: Clear | undefined;
  /**
   * The **`clip-path`** CSS property creates a clipping region that sets what part of an element should be shown. Parts that are inside the region are shown, while those outside are hidden.
   * 
   * **Syntax**: `<clip-source> | [ <basic-shape> || <geometry-box> ] | none`
   * 
   * **Initial value**: `none`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **55**  | **3.5** | **9.1** | **79** | **10** |
   * | 23 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/clip-path
   */
  "clip-path"?: ClipPath | undefined;
  /**
   * The **`color`** CSS property sets the foreground color value of an element's text and text decorations, and sets the `<currentcolor>` value. `currentcolor` may be used as an indirect value on _other_ properties and is the default for other color properties, such as `border-color`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `canvastext`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/color
   */
  color?: Color | undefined;
  /**
   * The **`print-color-adjust`** CSS property sets what, if anything, the user agent may do to optimize the appearance of the element on the output device. By default, the browser is allowed to make any adjustments to the element's appearance it determines to be necessary and prudent given the type and capabilities of the output device.
   * 
   * **Syntax**: `economy | exact`
   * 
   * **Initial value**: `economy`
   * 
   * |    Chrome    |       Firefox       |  Safari  |     Edge     | IE  |
   * | :----------: | :-----------------: | :------: | :----------: | :-: |
   * | **17** _-x-_ |       **97**        | **15.4** | **79** _-x-_ | No  |
   * |              | 48 _(color-adjust)_ | 6 _-x-_  |              |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/print-color-adjust
   */
  "color-adjust"?: PrintColorAdjust | undefined;
  /**
   * The **`color-scheme`** CSS property allows an element to indicate which color schemes it can comfortably be rendered in.
   * 
   * **Syntax**: `normal | [ light | dark | <custom-ident> ]+ && only?`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **81** | **96**  | **13** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/color-scheme
   */
  "color-scheme"?: ColorScheme | undefined;
  /**
   * The **`column-count`** CSS property breaks an element's content into the specified number of columns.
   * 
   * **Syntax**: `<integer> | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **50**  | **52**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-count
   */
  "column-count"?: ColumnCount | undefined;
  /**
   * The **`column-fill`** CSS property controls how an element's contents are balanced when broken into columns.
   * 
   * **Syntax**: `auto | balance | balance-all`
   * 
   * **Initial value**: `balance`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |   IE   |
   * | :----: | :-----: | :-----: | :----: | :----: |
   * | **50** | **52**  |  **9**  | **12** | **10** |
   * |        |         | 8 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-fill
   */
  "column-fill"?: ColumnFill | undefined;
  /**
   * The **`column-gap`** CSS property sets the size of the gap (gutter) between an element's columns.
   * 
   * **Syntax**: `normal | <length-percentage>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **1**  | **1.5** | **3**  | **12** | **10** |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-gap
   */
  "column-gap"?: ColumnGap<TLength> | undefined;
  /**
   * The **`column-rule-color`** CSS property sets the color of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **50**  | **52**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-rule-color
   */
  "column-rule-color"?: ColumnRuleColor | undefined;
  /**
   * The **`column-rule-style`** CSS property sets the style of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'border-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **50**  | **52**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-rule-style
   */
  "column-rule-style"?: ColumnRuleStyle | undefined;
  /**
   * The **`column-rule-width`** CSS property sets the width of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'border-width'>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **50**  | **52**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-rule-width
   */
  "column-rule-width"?: ColumnRuleWidth<TLength> | undefined;
  /**
   * The **`column-span`** CSS property makes it possible for an element to span across all columns when its value is set to `all`.
   * 
   * **Syntax**: `none | all`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
   * | :-----: | :-----: | :-------: | :----: | :----: |
   * | **50**  | **71**  |   **9**   | **12** | **10** |
   * | 6 _-x-_ |         | 5.1 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-span
   */
  "column-span"?: ColumnSpan | undefined;
  /**
   * The **`column-width`** CSS property sets the ideal column width in a multi-column layout. The container will have as many columns as can fit without any of them having a width less than the `column-width` value. If the width of the container is narrower than the specified value, the single column's width will be smaller than the declared column width.
   * 
   * **Syntax**: `<length> | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **50**  | **50**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-width
   */
  "column-width"?: ColumnWidth<TLength> | undefined;
  /**
   * The **`contain`** CSS property allows an author to indicate that an element and its contents are, as much as possible, _independent_ of the rest of the document tree. This allows the browser to recalculate layout, style, paint, size, or any combination of them for a limited area of the DOM and not the entire page, leading to obvious performance benefits.
   * 
   * **Syntax**: `none | strict | content | [ [ size || inline-size ] || layout || style || paint ]`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **52** | **69**  | **15.4** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/contain
   */
  contain?: Contain | undefined;
  /**
   * The **`content`** CSS property replaces an element with a generated value. Objects inserted using the `content` property are **anonymous replaced elements**.
   * 
   * **Syntax**: `normal | none | [ <content-replacement> | <content-list> ] [/ [ <string> | <counter> ]+ ]?`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/content
   */
  content?: Content | undefined;
  /**
   * The **`content-visibility`** CSS property controls whether or not an element renders its contents at all, along with forcing a strong set of containments, allowing user agents to potentially omit large swathes of layout and rendering work until it becomes needed. Basically it enables the user agent to skip an element's rendering work (including layout and painting) until it is needed — which makes the initial page load much faster.
   * 
   * **Syntax**: `visible | auto | hidden`
   * 
   * **Initial value**: `visible`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **85** |   No    |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/content-visibility
   */
  "content-visibility"?: ContentVisibility | undefined;
  /**
   * The **`counter-increment`** CSS property increases or decreases the value of a CSS counter by a given value.
   * 
   * **Syntax**: `[ <counter-name> <integer>? ]+ | none`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **2**  |  **1**  | **3**  | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/counter-increment
   */
  "counter-increment"?: CounterIncrement | undefined;
  /**
   * The **`counter-reset`** CSS property resets a CSS counter to a given value. This property will create a new counter or reversed counter with the given name on the specified element.
   * 
   * **Syntax**: `[ <counter-name> <integer>? | <reversed-counter-name> <integer>? ]+ | none`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **2**  |  **1**  | **3**  | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/counter-reset
   */
  "counter-reset"?: CounterReset | undefined;
  /**
   * The **`counter-set`** CSS property sets a CSS counter to a given value. It manipulates the value of existing counters, and will only create new counters if there isn't already a counter of the given name on the element.
   * 
   * **Syntax**: `[ <counter-name> <integer>? ]+ | none`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **85** | **68**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/counter-set
   */
  "counter-set"?: CounterSet | undefined;
  /**
   * The **`cursor`** CSS property sets the mouse cursor, if any, to show when the mouse pointer is over an element.
   * 
   * **Syntax**: `[ [ <url> [ <x> <y> ]? , ]* [ auto | default | none | context-menu | help | pointer | progress | wait | cell | crosshair | text | vertical-text | alias | copy | move | no-drop | not-allowed | e-resize | n-resize | ne-resize | nw-resize | s-resize | se-resize | sw-resize | w-resize | ew-resize | ns-resize | nesw-resize | nwse-resize | col-resize | row-resize | all-scroll | zoom-in | zoom-out | grab | grabbing ] ]`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **1**  | **1.2** | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/cursor
   */
  cursor?: Cursor | undefined;
  /**
   * The **`direction`** CSS property sets the direction of text, table columns, and horizontal overflow. Use `rtl` for languages written from right to left (like Hebrew or Arabic), and `ltr` for those written from left to right (like English and most other languages).
   * 
   * **Syntax**: `ltr | rtl`
   * 
   * **Initial value**: `ltr`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **2**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/direction
   */
  direction?: Direction | undefined;
  /**
   * The **`display`** CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.
   * 
   * **Syntax**: `[ <display-outside> || <display-inside> ] | <display-listitem> | <display-internal> | <display-box> | <display-legacy>`
   * 
   * **Initial value**: `inline`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/display
   */
  display?: Display | undefined;
  /**
   * The **`empty-cells`** CSS property sets whether borders and backgrounds appear around `<table>` cells that have no visible content.
   * 
   * **Syntax**: `show | hide`
   * 
   * **Initial value**: `show`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **1**  | **1.2** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/empty-cells
   */
  "empty-cells"?: EmptyCells | undefined;
  /**
   * The **`filter`** CSS property applies graphical effects like blur or color shift to an element. Filters are commonly used to adjust the rendering of images, backgrounds, and borders.
   * 
   * **Syntax**: `none | <filter-function-list>`
   * 
   * **Initial value**: `none`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  | IE  |
   * | :------: | :-----: | :-----: | :----: | :-: |
   * |  **53**  | **35**  | **9.1** | **12** | No  |
   * | 18 _-x-_ |         | 6 _-x-_ |        |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/filter
   */
  filter?: Filter | undefined;
  /**
   * The **`flex-basis`** CSS property sets the initial main size of a flex item. It sets the size of the content box unless otherwise set with `box-sizing`.
   * 
   * **Syntax**: `content | <'width'>`
   * 
   * **Initial value**: `auto`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **22**  |  **9**  | **12** | **11** |
   * | 22 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-basis
   */
  "flex-basis"?: FlexBasis<TLength> | undefined;
  /**
   * The **`flex-direction`** CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).
   * 
   * **Syntax**: `row | row-reverse | column | column-reverse`
   * 
   * **Initial value**: `row`
   * 
   * |  Chrome  | Firefox  | Safari  |  Edge  |    IE    |
   * | :------: | :------: | :-----: | :----: | :------: |
   * |  **29**  |  **81**  |  **9**  | **12** |  **11**  |
   * | 21 _-x-_ | 49 _-x-_ | 7 _-x-_ |        | 10 _-x-_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-direction
   */
  "flex-direction"?: FlexDirection | undefined;
  /**
   * The **`flex-grow`** CSS property sets the flex grow factor of a flex item's main size.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |            IE            |
   * | :------: | :-----: | :-----: | :----: | :----------------------: |
   * |  **29**  | **20**  |  **9**  | **12** |          **11**          |
   * | 22 _-x-_ |         | 7 _-x-_ |        | 10 _(-ms-flex-positive)_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-grow
   */
  "flex-grow"?: FlexGrow | undefined;
  /**
   * The **`flex-shrink`** CSS property sets the flex shrink factor of a flex item. If the size of all flex items is larger than the flex container, items shrink to fit according to `flex-shrink`.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `1`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **20**  |  **9**  | **12** | **10** |
   * | 22 _-x-_ |         | 8 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-shrink
   */
  "flex-shrink"?: FlexShrink | undefined;
  /**
   * The **`flex-wrap`** CSS property sets whether flex items are forced onto one line or can wrap onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked.
   * 
   * **Syntax**: `nowrap | wrap | wrap-reverse`
   * 
   * **Initial value**: `nowrap`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **28**  |  **9**  | **12** | **11** |
   * | 21 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-wrap
   */
  "flex-wrap"?: FlexWrap | undefined;
  /**
   * The **`float`** CSS property places an element on the left or right side of its container, allowing text and inline elements to wrap around it. The element is removed from the normal flow of the page, though still remaining a part of the flow (in contrast to absolute positioning).
   * 
   * **Syntax**: `left | right | none | inline-start | inline-end`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/float
   */
  float?: Float | undefined;
  /**
   * The **`font-family`** CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.
   * 
   * **Syntax**: `[ <family-name> | <generic-family> ]#`
   * 
   * **Initial value**: depends on user agent
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-family
   */
  "font-family"?: FontFamily | undefined;
  /**
   * The **`font-feature-settings`** CSS property controls advanced typographic features in OpenType fonts.
   * 
   * **Syntax**: `normal | <feature-tag-value>#`
   * 
   * **Initial value**: `normal`
   * 
   * |  Chrome  | Firefox  | Safari  |  Edge  |   IE   |
   * | :------: | :------: | :-----: | :----: | :----: |
   * |  **48**  |  **34**  | **9.1** | **15** | **10** |
   * | 16 _-x-_ | 15 _-x-_ |         |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-feature-settings
   */
  "font-feature-settings"?: FontFeatureSettings | undefined;
  /**
   * The **`font-kerning`** CSS property sets the use of the kerning information stored in a font.
   * 
   * **Syntax**: `auto | normal | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * | **33** | **32**  |  **9**  | n/a  | No  |
   * |        |         | 6 _-x-_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-kerning
   */
  "font-kerning"?: FontKerning | undefined;
  /**
   * The **`font-language-override`** CSS property controls the use of language-specific glyphs in a typeface.
   * 
   * **Syntax**: `normal | <string>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **34**  |   No   | n/a  | No  |
   * |        | 4 _-x-_ |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-language-override
   */
  "font-language-override"?: FontLanguageOverride | undefined;
  /**
   * The **`font-optical-sizing`** CSS property sets whether text rendering is optimized for viewing at different sizes.
   * 
   * **Syntax**: `auto | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **79** | **62**  | **11** | **17** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-optical-sizing
   */
  "font-optical-sizing"?: FontOpticalSizing | undefined;
  /**
   * The **`font-size`** CSS property sets the size of the font. Changing the font size also updates the sizes of the font size-relative `<length>` units, such as `em`, `ex`, and so forth.
   * 
   * **Syntax**: `<absolute-size> | <relative-size> | <length-percentage>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-size
   */
  "font-size"?: FontSize<TLength> | undefined;
  /**
   * The **`font-size-adjust`** CSS property sets the size of lower-case letters relative to the current font size (which defines the size of upper-case letters).
   * 
   * **Syntax**: `none | [ ex-height | cap-height | ch-width | ic-width | ic-height ]? [ from-font | <number> ]`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   |  **3**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-size-adjust
   */
  "font-size-adjust"?: FontSizeAdjust | undefined;
  /**
   * The **`font-smooth`** CSS property controls the application of anti-aliasing when fonts are rendered.
   * 
   * **Syntax**: `auto | never | always | <absolute-size> | <length>`
   * 
   * **Initial value**: `auto`
   * 
   * |              Chrome              |              Firefox               |              Safari              | Edge | IE  |
   * | :------------------------------: | :--------------------------------: | :------------------------------: | :--: | :-: |
   * | **5** _(-webkit-font-smoothing)_ | **25** _(-moz-osx-font-smoothing)_ | **4** _(-webkit-font-smoothing)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-smooth
   */
  "font-smooth"?: FontSmooth<TLength> | undefined;
  /**
   * The **`font-stretch`** CSS property selects a normal, condensed, or expanded face from a font.
   * 
   * **Syntax**: `<font-stretch-absolute>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **60** |  **9**  | **11** | **12** | **9** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-stretch
   */
  "font-stretch"?: FontStretch | undefined;
  /**
   * The **`font-style`** CSS property sets whether a font should be styled with a normal, italic, or oblique face from its `font-family`.
   * 
   * **Syntax**: `normal | italic | oblique <angle>?`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-style
   */
  "font-style"?: FontStyle | undefined;
  /**
   * The **`font-synthesis`** CSS property controls which missing typefaces, bold, italic, or small-caps, may be synthesized by the browser.
   * 
   * **Syntax**: `none | [ weight || style || small-caps ]`
   * 
   * **Initial value**: `weight style`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **97** | **34**  | **9**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-synthesis
   */
  "font-synthesis"?: FontSynthesis | undefined;
  /**
   * The **`font-variant`** CSS shorthand property allows you to set all the font variants for a font.
   * 
   * **Syntax**: `normal | none | [ <common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> || stylistic( <feature-value-name> ) || historical-forms || styleset( <feature-value-name># ) || character-variant( <feature-value-name># ) || swash( <feature-value-name> ) || ornaments( <feature-value-name> ) || annotation( <feature-value-name> ) || [ small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps ] || <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero || <east-asian-variant-values> || <east-asian-width-values> || ruby ]`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant
   */
  "font-variant"?: FontVariant | undefined;
  /**
   * The **`font-variant-alternates`** CSS property controls the usage of alternate glyphs. These alternate glyphs may be referenced by alternative names defined in `@font-feature-values`.
   * 
   * **Syntax**: `normal | [ stylistic( <feature-value-name> ) || historical-forms || styleset( <feature-value-name># ) || character-variant( <feature-value-name># ) || swash( <feature-value-name> ) || ornaments( <feature-value-name> ) || annotation( <feature-value-name> ) ]`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * |   No   | **34**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-alternates
   */
  "font-variant-alternates"?: FontVariantAlternates | undefined;
  /**
   * The **`font-variant-caps`** CSS property controls the use of alternate glyphs for capital letters.
   * 
   * **Syntax**: `normal | small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * | **52** | **34**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-caps
   */
  "font-variant-caps"?: FontVariantCaps | undefined;
  /**
   * The **`font-variant-east-asian`** CSS property controls the use of alternate glyphs for East Asian scripts, like Japanese and Chinese.
   * 
   * **Syntax**: `normal | [ <east-asian-variant-values> || <east-asian-width-values> || ruby ]`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * | **63** | **34**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-east-asian
   */
  "font-variant-east-asian"?: FontVariantEastAsian | undefined;
  /**
   * The **`font-variant-ligatures`** CSS property controls which ligatures and contextual forms are used in textual content of the elements it applies to. This leads to more harmonized forms in the resulting text.
   * 
   * **Syntax**: `normal | none | [ <common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> ]`
   * 
   * **Initial value**: `normal`
   * 
   * |  Chrome  | Firefox | Safari  | Edge | IE  |
   * | :------: | :-----: | :-----: | :--: | :-: |
   * |  **34**  | **34**  | **9.1** | n/a  | No  |
   * | 31 _-x-_ |         | 7 _-x-_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-ligatures
   */
  "font-variant-ligatures"?: FontVariantLigatures | undefined;
  /**
   * The **`font-variant-numeric`** CSS property controls the usage of alternate glyphs for numbers, fractions, and ordinal markers.
   * 
   * **Syntax**: `normal | [ <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero ]`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * | **52** | **34**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric
   */
  "font-variant-numeric"?: FontVariantNumeric | undefined;
  /**
   * The **`font-variant-position`** CSS property controls the use of alternate, smaller glyphs that are positioned as superscript or subscript.
   * 
   * **Syntax**: `normal | sub | super`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * |   No   | **34**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-position
   */
  "font-variant-position"?: FontVariantPosition | undefined;
  /**
   * The **`font-variation-settings`** CSS property provides low-level control over variable font characteristics, by specifying the four letter axis names of the characteristics you want to vary, along with their values.
   * 
   * **Syntax**: `normal | [ <string> <number> ]#`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **62** | **62**  | **11** | **17** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-variation-settings
   */
  "font-variation-settings"?: FontVariationSettings | undefined;
  /**
   * The **`font-weight`** CSS property sets the weight (or boldness) of the font. The weights available depend on the `font-family` that is currently set.
   * 
   * **Syntax**: `<font-weight-absolute> | bolder | lighter`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **2**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font-weight
   */
  "font-weight"?: FontWeight | undefined;
  /**
   * The **`forced-color-adjust`** CSS property allows authors to opt certain elements out of forced colors mode. This then restores the control of those values to CSS.
   * 
   * **Syntax**: `auto | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |              Edge               |                 IE                  |
   * | :----: | :-----: | :----: | :-----------------------------: | :---------------------------------: |
   * | **89** |   No    |   No   |             **79**              | **10** _(-ms-high-contrast-adjust)_ |
   * |        |         |        | 12 _(-ms-high-contrast-adjust)_ |                                     |
   * @see https://developer.mozilla.org/docs/Web/CSS/forced-color-adjust
   */
  "forced-color-adjust"?: ForcedColorAdjust | undefined;
  /**
   * The **`grid-auto-columns`** CSS property specifies the size of an implicitly-created grid column track or pattern of tracks.
   * 
   * **Syntax**: `<track-size>+`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  |             IE              |
   * | :----: | :-----: | :------: | :----: | :-------------------------: |
   * | **57** | **70**  | **10.1** | **16** | **10** _(-ms-grid-columns)_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-columns
   */
  "grid-auto-columns"?: GridAutoColumns<TLength> | undefined;
  /**
   * The **`grid-auto-flow`** CSS property controls how the auto-placement algorithm works, specifying exactly how auto-placed items get flowed into the grid.
   * 
   * **Syntax**: `[ row | column ] || dense`
   * 
   * **Initial value**: `row`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-flow
   */
  "grid-auto-flow"?: GridAutoFlow | undefined;
  /**
   * The **`grid-auto-rows`** CSS property specifies the size of an implicitly-created grid row track or pattern of tracks.
   * 
   * **Syntax**: `<track-size>+`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  |            IE            |
   * | :----: | :-----: | :------: | :----: | :----------------------: |
   * | **57** | **70**  | **10.1** | **16** | **10** _(-ms-grid-rows)_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-rows
   */
  "grid-auto-rows"?: GridAutoRows<TLength> | undefined;
  /**
   * The **`grid-column-end`** CSS property specifies a grid item's end position within the grid column by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the block-end edge of its grid area.
   * 
   * **Syntax**: `<grid-line>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-column-end
   */
  "grid-column-end"?: GridColumnEnd | undefined;
  /**
   * The **`grid-column-start`** CSS property specifies a grid item's start position within the grid column by contributing a line, a span, or nothing (automatic) to its grid placement. This start position defines the block-start edge of the grid area.
   * 
   * **Syntax**: `<grid-line>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-column-start
   */
  "grid-column-start"?: GridColumnStart | undefined;
  /**
   * The **`grid-row-end`** CSS property specifies a grid item's end position within the grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-end edge of its grid area.
   * 
   * **Syntax**: `<grid-line>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-row-end
   */
  "grid-row-end"?: GridRowEnd | undefined;
  /**
   * The **`grid-row-start`** CSS property specifies a grid item's start position within the grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start edge of its grid area.
   * 
   * **Syntax**: `<grid-line>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-row-start
   */
  "grid-row-start"?: GridRowStart | undefined;
  /**
   * The **`grid-template-areas`** CSS property specifies named grid areas, establishing the cells in the grid and assigning them names.
   * 
   * **Syntax**: `none | <string>+`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-areas
   */
  "grid-template-areas"?: GridTemplateAreas | undefined;
  /**
   * The **`grid-template-columns`** CSS property defines the line names and track sizing functions of the grid columns.
   * 
   * **Syntax**: `none | <track-list> | <auto-track-list> | subgrid <line-name-list>?`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  |             IE              |
   * | :----: | :-----: | :------: | :----: | :-------------------------: |
   * | **57** | **52**  | **10.1** | **16** | **10** _(-ms-grid-columns)_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-columns
   */
  "grid-template-columns"?: GridTemplateColumns<TLength> | undefined;
  /**
   * The **`grid-template-rows`** CSS property defines the line names and track sizing functions of the grid rows.
   * 
   * **Syntax**: `none | <track-list> | <auto-track-list> | subgrid <line-name-list>?`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  |            IE            |
   * | :----: | :-----: | :------: | :----: | :----------------------: |
   * | **57** | **52**  | **10.1** | **16** | **10** _(-ms-grid-rows)_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-rows
   */
  "grid-template-rows"?: GridTemplateRows<TLength> | undefined;
  /**
   * The **`hanging-punctuation`** CSS property specifies whether a punctuation mark should hang at the start or end of a line of text. Hanging punctuation may be placed outside the line box.
   * 
   * **Syntax**: `none | [ first || [ force-end | allow-end ] || last ]`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   |   No    | **10** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/hanging-punctuation
   */
  "hanging-punctuation"?: HangingPunctuation | undefined;
  /**
   * The **`height`** CSS property specifies the height of an element. By default, the property defines the height of the content area. If `box-sizing` is set to `border-box`, however, it instead determines the height of the border area.
   * 
   * **Syntax**: `auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/height
   */
  height?: Height<TLength> | undefined;
  /**
   * The **`hyphenate-character`** CSS property sets the character (or string) used at the end of a line before a hyphenation break.
   * 
   * **Syntax**: `auto | <string>`
   * 
   * **Initial value**: `auto`
   * 
   * |   Chrome    | Firefox |    Safari     | Edge | IE  |
   * | :---------: | :-----: | :-----------: | :--: | :-: |
   * | **6** _-x-_ | **98**  | **5.1** _-x-_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/hyphenate-character
   */
  "hyphenate-character"?: HyphenateCharacter | undefined;
  /**
   * The **`hyphens`** CSS property specifies how words should be hyphenated when text wraps across multiple lines. It can prevent hyphenation entirely, hyphenate at manually-specified points within the text, or let the browser automatically insert hyphens where appropriate.
   * 
   * **Syntax**: `none | manual | auto`
   * 
   * **Initial value**: `manual`
   * 
   * |  Chrome  | Firefox |    Safari     |  Edge  |      IE      |
   * | :------: | :-----: | :-----------: | :----: | :----------: |
   * |  **55**  | **43**  | **5.1** _-x-_ | **79** | **10** _-x-_ |
   * | 13 _-x-_ | 6 _-x-_ |               |        |              |
   * @see https://developer.mozilla.org/docs/Web/CSS/hyphens
   */
  hyphens?: Hyphens | undefined;
  /**
   * The **`image-orientation`** CSS property specifies a layout-independent correction to the orientation of an image.
   * 
   * **Syntax**: `from-image | <angle> | [ <angle>? flip ]`
   * 
   * **Initial value**: `from-image`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **81** | **26**  | **13.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/image-orientation
   */
  "image-orientation"?: ImageOrientation | undefined;
  /**
   * The **`image-rendering`** CSS property sets an image scaling algorithm. The property applies to an element itself, to any images set in its other properties, and to its descendants.
   * 
   * **Syntax**: `auto | crisp-edges | pixelated`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **13** | **3.6** | **6**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/image-rendering
   */
  "image-rendering"?: ImageRendering | undefined;
  /**
   * **Syntax**: `[ from-image || <resolution> ] && snap?`
   * 
   * **Initial value**: `1dppx`
   */
  "image-resolution"?: ImageResolution | undefined;
  /**
   * The `initial-letter` CSS property sets styling for dropped, raised, and sunken initial letters.
   * 
   * **Syntax**: `normal | [ <number> <integer>? ]`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox |   Safari    | Edge | IE  |
   * | :----: | :-----: | :---------: | :--: | :-: |
   * |   No   |   No    | **9** _-x-_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/initial-letter
   */
  "initial-letter"?: InitialLetter | undefined;
  /**
   * The **`inline-size`** CSS property defines the horizontal or vertical size of an element's block, depending on its writing mode. It corresponds to either the `width` or the `height` property, depending on the value of `writing-mode`.
   * 
   * **Syntax**: `<'width'>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inline-size
   */
  "inline-size"?: InlineSize<TLength> | undefined;
  /**
   * **Syntax**: `auto | none`
   * 
   * **Initial value**: `auto`
   */
  "input-security"?: InputSecurity | undefined;
  /**
   * The **`inset`** CSS property is a shorthand that corresponds to the `top`, `right`, `bottom`, and/or `left` properties. It has the same multi-value syntax of the `margin` shorthand.
   * 
   * **Syntax**: `<'top'>{1,4}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset
   */
  inset?: Inset<TLength> | undefined;
  /**
   * The **`inset-block`** CSS property defines the logical block start and end offsets of an element, which maps to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top` and `bottom`, or `right` and `left` properties depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>{1,2}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **63**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset-block
   */
  "inset-block"?: InsetBlock<TLength> | undefined;
  /**
   * The **`inset-block-end`** CSS property defines the logical block end offset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **63**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset-block-end
   */
  "inset-block-end"?: InsetBlockEnd<TLength> | undefined;
  /**
   * The **`inset-block-start`** CSS property defines the logical block start offset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **63**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset-block-start
   */
  "inset-block-start"?: InsetBlockStart<TLength> | undefined;
  /**
   * The **`inset-inline`** CSS property defines the logical start and end offsets of an element in the inline direction, which maps to physical offsets depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top` and `bottom`, or `right` and `left` properties depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>{1,2}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **63**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset-inline
   */
  "inset-inline"?: InsetInline<TLength> | undefined;
  /**
   * The **`inset-inline-end`** CSS property defines the logical inline end inset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **63**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset-inline-end
   */
  "inset-inline-end"?: InsetInlineEnd<TLength> | undefined;
  /**
   * The **`inset-inline-start`** CSS property defines the logical inline start inset of an element, which maps to a physical offset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'top'>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **63**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/inset-inline-start
   */
  "inset-inline-start"?: InsetInlineStart<TLength> | undefined;
  /**
   * The **`isolation`** CSS property determines whether an element must create a new stacking context.
   * 
   * **Syntax**: `auto | isolate`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **41** | **36**  | **8**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/isolation
   */
  isolation?: Isolation | undefined;
  /**
   * The CSS **`justify-content`** property defines how the browser distributes space between and around content items along the main-axis of a flex container, and the inline axis of a grid container.
   * 
   * **Syntax**: `normal | <content-distribution> | <overflow-position>? [ <content-position> | left | right ]`
   * 
   * **Initial value**: `normal`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **20**  |  **9**  | **12** | **11** |
   * | 21 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/justify-content
   */
  "justify-content"?: JustifyContent | undefined;
  /**
   * The CSS **`justify-items`** property defines the default `justify-self` for all items of the box, giving them all a default way of justifying each box along the appropriate axis.
   * 
   * **Syntax**: `normal | stretch | <baseline-position> | <overflow-position>? [ <self-position> | left | right ] | legacy | legacy && [ left | right | center ]`
   * 
   * **Initial value**: `legacy`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **52** | **20**  | **9**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/justify-items
   */
  "justify-items"?: JustifyItems | undefined;
  /**
   * The CSS **`justify-self`** property sets the way a box is justified inside its alignment container along the appropriate axis.
   * 
   * **Syntax**: `auto | normal | stretch | <baseline-position> | <overflow-position>? [ <self-position> | left | right ]`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  |   IE   |
   * | :----: | :-----: | :------: | :----: | :----: |
   * | **57** | **45**  | **10.1** | **16** | **10** |
   * @see https://developer.mozilla.org/docs/Web/CSS/justify-self
   */
  "justify-self"?: JustifySelf | undefined;
  /**
   * The **`justify-tracks`** CSS property sets the alignment in the masonry axis for grid containers that have masonry in their inline axis.
   * 
   * **Syntax**: `[ normal | <content-distribution> | <overflow-position>? [ <content-position> | left | right ] ]#`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   |   n/a   |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/justify-tracks
   */
  "justify-tracks"?: JustifyTracks | undefined;
  /**
   * The **`left`** CSS property participates in specifying the horizontal position of a positioned element. It has no effect on non-positioned elements.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/left
   */
  left?: Left<TLength> | undefined;
  /**
   * The **`letter-spacing`** CSS property sets the horizontal spacing behavior between text characters. This value is added to the natural spacing between characters while rendering the text. Positive values of `letter-spacing` causes characters to spread farther apart, while negative values of `letter-spacing` bring characters closer together.
   * 
   * **Syntax**: `normal | <length>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/letter-spacing
   */
  "letter-spacing"?: LetterSpacing<TLength> | undefined;
  /**
   * The **`line-break`** CSS property sets how to break lines of Chinese, Japanese, or Korean (CJK) text when working with punctuation and symbols.
   * 
   * **Syntax**: `auto | loose | normal | strict | anywhere`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE    |
   * | :-----: | :-----: | :-----: | :----: | :-----: |
   * | **58**  | **69**  | **11**  | **14** | **5.5** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |         |
   * @see https://developer.mozilla.org/docs/Web/CSS/line-break
   */
  "line-break"?: LineBreak | undefined;
  /**
   * The **`line-height`** CSS property sets the height of a line box. It's commonly used to set the distance between lines of text. On block-level elements, it specifies the minimum height of line boxes within the element. On non-replaced inline elements, it specifies the height that is used to calculate line box height.
   * 
   * **Syntax**: `normal | <number> | <length> | <percentage>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/line-height
   */
  "line-height"?: LineHeight<TLength> | undefined;
  /**
   * The **`line-height-step`** CSS property sets the step unit for line box heights. When the property is set, line box heights are rounded up to the closest multiple of the unit.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |  n/a   |   No    |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/line-height-step
   */
  "line-height-step"?: LineHeightStep<TLength> | undefined;
  /**
   * The **`list-style-image`** CSS property sets an image to be used as the list item marker.
   * 
   * **Syntax**: `<image> | none`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/list-style-image
   */
  "list-style-image"?: ListStyleImage | undefined;
  /**
   * The **`list-style-position`** CSS property sets the position of the `::marker` relative to a list item.
   * 
   * **Syntax**: `inside | outside`
   * 
   * **Initial value**: `outside`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/list-style-position
   */
  "list-style-position"?: ListStylePosition | undefined;
  /**
   * The **`list-style-type`** CSS property sets the marker (such as a disc, character, or custom counter style) of a list item element.
   * 
   * **Syntax**: `<counter-style> | <string> | none`
   * 
   * **Initial value**: `disc`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/list-style-type
   */
  "list-style-type"?: ListStyleType | undefined;
  /**
   * The **`margin-block`** CSS shorthand property defines the logical block start and end margins of an element, which maps to physical margins depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'margin-left'>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-block
   */
  "margin-block"?: MarginBlock<TLength> | undefined;
  /**
   * The **`margin-block-end`** CSS property defines the logical block end margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-block-end
   */
  "margin-block-end"?: MarginBlockEnd<TLength> | undefined;
  /**
   * The **`margin-block-start`** CSS property defines the logical block start margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-block-start
   */
  "margin-block-start"?: MarginBlockStart<TLength> | undefined;
  /**
   * The **`margin-bottom`** CSS property sets the margin area on the bottom of an element. A positive value places it farther from its neighbors, while a negative value places it closer.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-bottom
   */
  "margin-bottom"?: MarginBottom<TLength> | undefined;
  /**
   * The **`margin-inline`** CSS shorthand property is a shorthand property that defines both the logical inline start and end margins of an element, which maps to physical margins depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'margin-left'>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-inline
   */
  "margin-inline"?: MarginInline<TLength> | undefined;
  /**
   * The **`margin-inline-end`** CSS property defines the logical inline end margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation. In other words, it corresponds to the `margin-top`, `margin-right`, `margin-bottom` or `margin-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   * 
   * |          Chrome          |        Firefox        |          Safari          | Edge | IE  |
   * | :----------------------: | :-------------------: | :----------------------: | :--: | :-: |
   * |          **87**          |        **41**         |         **12.1**         | n/a  | No  |
   * | 2 _(-webkit-margin-end)_ | 3 _(-moz-margin-end)_ | 3 _(-webkit-margin-end)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-inline-end
   */
  "margin-inline-end"?: MarginInlineEnd<TLength> | undefined;
  /**
   * The **`margin-inline-start`** CSS property defines the logical inline start margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation. It corresponds to the `margin-top`, `margin-right`, `margin-bottom`, or `margin-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   * 
   * |           Chrome           |         Firefox         |           Safari           | Edge | IE  |
   * | :------------------------: | :---------------------: | :------------------------: | :--: | :-: |
   * |           **87**           |         **41**          |          **12.1**          | n/a  | No  |
   * | 2 _(-webkit-margin-start)_ | 3 _(-moz-margin-start)_ | 3 _(-webkit-margin-start)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-inline-start
   */
  "margin-inline-start"?: MarginInlineStart<TLength> | undefined;
  /**
   * The **`margin-left`** CSS property sets the margin area on the left side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-left
   */
  "margin-left"?: MarginLeft<TLength> | undefined;
  /**
   * The **`margin-right`** CSS property sets the margin area on the right side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-right
   */
  "margin-right"?: MarginRight<TLength> | undefined;
  /**
   * The **`margin-top`** CSS property sets the margin area on the top of an element. A positive value places it farther from its neighbors, while a negative value places it closer.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin-top
   */
  "margin-top"?: MarginTop<TLength> | undefined;
  /**
   * The **`mask-border-mode`** CSS property specifies the blending mode used in a mask border.
   * 
   * **Syntax**: `luminance | alpha`
   * 
   * **Initial value**: `alpha`
   */
  "mask-border-mode"?: MaskBorderMode | undefined;
  /**
   * The **`mask-border-outset`** CSS property specifies the distance by which an element's mask border is set out from its border box.
   * 
   * **Syntax**: `[ <length> | <number> ]{1,4}`
   * 
   * **Initial value**: `0`
   * 
   * |                 Chrome                  | Firefox |                  Safari                   | Edge | IE  |
   * | :-------------------------------------: | :-----: | :---------------------------------------: | :--: | :-: |
   * | **1** _(-webkit-mask-box-image-outset)_ |   No    | **3.1** _(-webkit-mask-box-image-outset)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-border-outset
   */
  "mask-border-outset"?: MaskBorderOutset<TLength> | undefined;
  /**
   * The **`mask-border-repeat`** CSS property sets how the edge regions of a source image are adjusted to fit the dimensions of an element's mask border.
   * 
   * **Syntax**: `[ stretch | repeat | round | space ]{1,2}`
   * 
   * **Initial value**: `stretch`
   * 
   * |                 Chrome                  | Firefox |                  Safari                   | Edge | IE  |
   * | :-------------------------------------: | :-----: | :---------------------------------------: | :--: | :-: |
   * | **1** _(-webkit-mask-box-image-repeat)_ |   No    | **3.1** _(-webkit-mask-box-image-repeat)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-border-repeat
   */
  "mask-border-repeat"?: MaskBorderRepeat | undefined;
  /**
   * The **`mask-border-slice`** CSS property divides the image set by `mask-border-source` into regions. These regions are used to form the components of an element's mask border.
   * 
   * **Syntax**: `<number-percentage>{1,4} fill?`
   * 
   * **Initial value**: `0`
   * 
   * |                 Chrome                 | Firefox |                  Safari                  | Edge | IE  |
   * | :------------------------------------: | :-----: | :--------------------------------------: | :--: | :-: |
   * | **1** _(-webkit-mask-box-image-slice)_ |   No    | **3.1** _(-webkit-mask-box-image-slice)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-border-slice
   */
  "mask-border-slice"?: MaskBorderSlice | undefined;
  /**
   * The **`mask-border-source`** CSS property sets the source image used to create an element's mask border.
   * 
   * **Syntax**: `none | <image>`
   * 
   * **Initial value**: `none`
   * 
   * |                 Chrome                  | Firefox |                  Safari                   | Edge | IE  |
   * | :-------------------------------------: | :-----: | :---------------------------------------: | :--: | :-: |
   * | **1** _(-webkit-mask-box-image-source)_ |   No    | **3.1** _(-webkit-mask-box-image-source)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-border-source
   */
  "mask-border-source"?: MaskBorderSource | undefined;
  /**
   * The **`mask-border-width`** CSS property sets the width of an element's mask border.
   * 
   * **Syntax**: `[ <length-percentage> | <number> | auto ]{1,4}`
   * 
   * **Initial value**: `auto`
   * 
   * |                 Chrome                 | Firefox |                  Safari                  | Edge | IE  |
   * | :------------------------------------: | :-----: | :--------------------------------------: | :--: | :-: |
   * | **1** _(-webkit-mask-box-image-width)_ |   No    | **3.1** _(-webkit-mask-box-image-width)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-border-width
   */
  "mask-border-width"?: MaskBorderWidth<TLength> | undefined;
  /**
   * The **`mask-clip`** CSS property determines the area which is affected by a mask. The painted content of an element must be restricted to this area.
   * 
   * **Syntax**: `[ <geometry-box> | no-clip ]#`
   * 
   * **Initial value**: `border-box`
   * 
   * |   Chrome    | Firefox |  Safari  | Edge | IE  |
   * | :---------: | :-----: | :------: | :--: | :-: |
   * | **1** _-x-_ | **53**  | **15.4** | n/a  | No  |
   * |             |         | 4 _-x-_  |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-clip
   */
  "mask-clip"?: MaskClip | undefined;
  /**
   * The **`mask-composite`** CSS property represents a compositing operation used on the current mask layer with the mask layers below it.
   * 
   * **Syntax**: `<compositing-operator>#`
   * 
   * **Initial value**: `add`
   * 
   * | Chrome | Firefox |  Safari  | Edge  | IE  |
   * | :----: | :-----: | :------: | :---: | :-: |
   * |   No   | **53**  | **15.4** | 18-79 | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-composite
   */
  "mask-composite"?: MaskComposite | undefined;
  /**
   * The **`mask-image`** CSS property sets the image that is used as mask layer for an element. By default this means the alpha channel of the mask image will be multiplied with the alpha channel of the element. This can be controlled with the `mask-mode` property.
   * 
   * **Syntax**: `<mask-reference>#`
   * 
   * **Initial value**: `none`
   * 
   * |   Chrome    | Firefox |  Safari  | Edge  | IE  |
   * | :---------: | :-----: | :------: | :---: | :-: |
   * | **1** _-x-_ | **53**  | **15.4** | 16-79 | No  |
   * |             |         | 4 _-x-_  |       |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-image
   */
  "mask-image"?: MaskImage | undefined;
  /**
   * The **`mask-mode`** CSS property sets whether the mask reference defined by `mask-image` is treated as a luminance or alpha mask.
   * 
   * **Syntax**: `<masking-mode>#`
   * 
   * **Initial value**: `match-source`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * |   No   | **53**  | **15.4** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-mode
   */
  "mask-mode"?: MaskMode | undefined;
  /**
   * The **`mask-origin`** CSS property sets the origin of a mask.
   * 
   * **Syntax**: `<geometry-box>#`
   * 
   * **Initial value**: `border-box`
   * 
   * |   Chrome    | Firefox |  Safari  | Edge | IE  |
   * | :---------: | :-----: | :------: | :--: | :-: |
   * | **1** _-x-_ | **53**  | **15.4** | n/a  | No  |
   * |             |         | 4 _-x-_  |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-origin
   */
  "mask-origin"?: MaskOrigin | undefined;
  /**
   * The **`mask-position`** CSS property sets the initial position, relative to the mask position layer set by `mask-origin`, for each defined mask image.
   * 
   * **Syntax**: `<position>#`
   * 
   * **Initial value**: `center`
   * 
   * |   Chrome    | Firefox |  Safari   | Edge  | IE  |
   * | :---------: | :-----: | :-------: | :---: | :-: |
   * | **1** _-x-_ | **53**  | **15.4**  | 18-79 | No  |
   * |             |         | 3.1 _-x-_ |       |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-position
   */
  "mask-position"?: MaskPosition<TLength> | undefined;
  /**
   * The **`mask-repeat`** CSS property sets how mask images are repeated. A mask image can be repeated along the horizontal axis, the vertical axis, both axes, or not repeated at all.
   * 
   * **Syntax**: `<repeat-style>#`
   * 
   * **Initial value**: `no-repeat`
   * 
   * |   Chrome    | Firefox |  Safari   | Edge  | IE  |
   * | :---------: | :-----: | :-------: | :---: | :-: |
   * | **1** _-x-_ | **53**  | **15.4**  | 18-79 | No  |
   * |             |         | 3.1 _-x-_ |       |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-repeat
   */
  "mask-repeat"?: MaskRepeat | undefined;
  /**
   * The **`mask-size`** CSS property specifies the sizes of the mask images. The size of the image can be fully or partially constrained in order to preserve its intrinsic ratio.
   * 
   * **Syntax**: `<bg-size>#`
   * 
   * **Initial value**: `auto`
   * 
   * |   Chrome    | Firefox |  Safari  | Edge  | IE  |
   * | :---------: | :-----: | :------: | :---: | :-: |
   * | **4** _-x-_ | **53**  | **15.4** | 18-79 | No  |
   * |             |         | 4 _-x-_  |       |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-size
   */
  "mask-size"?: MaskSize<TLength> | undefined;
  /**
   * The **`mask-type`** CSS property sets whether an SVG `<mask>` element is used as a _luminance_ or an _alpha_ mask. It applies to the `<mask>` element itself.
   * 
   * **Syntax**: `luminance | alpha`
   * 
   * **Initial value**: `luminance`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **24** | **35**  | **7**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-type
   */
  "mask-type"?: MaskType | undefined;
  /**
   * The **`math-depth`** property describes a notion of _depth_ for each element of a mathematical formula, with respect to the top-level container of that formula. Concretely, this is used to determine the computed value of the font-size property when its specified value is `math`.
   * 
   * **Syntax**: `auto-add | add(<integer>) | <integer>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |  n/a   |   n/a   |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/math-depth
   */
  "math-depth"?: MathDepth | undefined;
  /**
   * The `math-shift` property indicates whether superscripts inside MathML formulas should be raised by a normal or compact shift.
   * 
   * **Syntax**: `normal | compact`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |  n/a   |   No    |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/math-shift
   */
  "math-shift"?: MathShift | undefined;
  /**
   * The `math-style` property indicates whether MathML equations should render with normal or compact height.
   * 
   * **Syntax**: `normal | compact`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * |  n/a   |   n/a   | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/math-style
   */
  "math-style"?: MathStyle | undefined;
  /**
   * The **`max-block-size`** CSS property specifies the maximum size of an element in the direction opposite that of the writing direction as specified by `writing-mode`. That is, if the writing direction is horizontal, then `max-block-size` is equivalent to `max-height`; if the writing direction is vertical, `max-block-size` is the same as `max-width`.
   * 
   * **Syntax**: `<'max-width'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/max-block-size
   */
  "max-block-size"?: MaxBlockSize<TLength> | undefined;
  /**
   * The **`max-height`** CSS property sets the maximum height of an element. It prevents the used value of the `height` property from becoming larger than the value specified for `max-height`.
   * 
   * **Syntax**: `none | <length-percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **18** |  **1**  | **1.3** | **12** | **7** |
   * @see https://developer.mozilla.org/docs/Web/CSS/max-height
   */
  "max-height"?: MaxHeight<TLength> | undefined;
  /**
   * The **`max-inline-size`** CSS property defines the horizontal or vertical maximum size of an element's block, depending on its writing mode. It corresponds to either the `max-width` or the `max-height` property, depending on the value of `writing-mode`.
   * 
   * **Syntax**: `<'max-width'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |   Safari   | Edge | IE  |
   * | :----: | :-----: | :--------: | :--: | :-: |
   * | **57** | **41**  |  **12.1**  | n/a  | No  |
   * |        |         | 10.1 _-x-_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/max-inline-size
   */
  "max-inline-size"?: MaxInlineSize<TLength> | undefined;
  /**
   * **Syntax**: `none | <integer>`
   * 
   * **Initial value**: `none`
   */
  "max-lines"?: MaxLines | undefined;
  /**
   * The **`max-width`** CSS property sets the maximum width of an element. It prevents the used value of the `width` property from becoming larger than the value specified by `max-width`.
   * 
   * **Syntax**: `none | <length-percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **7** |
   * @see https://developer.mozilla.org/docs/Web/CSS/max-width
   */
  "max-width"?: MaxWidth<TLength> | undefined;
  /**
   * The **`min-block-size`** CSS property defines the minimum horizontal or vertical size of an element's block, depending on its writing mode. It corresponds to either the `min-width` or the `min-height` property, depending on the value of `writing-mode`.
   * 
   * **Syntax**: `<'min-width'>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/min-block-size
   */
  "min-block-size"?: MinBlockSize<TLength> | undefined;
  /**
   * The **`min-height`** CSS property sets the minimum height of an element. It prevents the used value of the `height` property from becoming smaller than the value specified for `min-height`.
   * 
   * **Syntax**: `auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **3**  | **1.3** | **12** | **7** |
   * @see https://developer.mozilla.org/docs/Web/CSS/min-height
   */
  "min-height"?: MinHeight<TLength> | undefined;
  /**
   * The **`min-inline-size`** CSS property defines the horizontal or vertical minimal size of an element's block, depending on its writing mode. It corresponds to either the `min-width` or the `min-height` property, depending on the value of `writing-mode`.
   * 
   * **Syntax**: `<'min-width'>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/min-inline-size
   */
  "min-inline-size"?: MinInlineSize<TLength> | undefined;
  /**
   * The **`min-width`** CSS property sets the minimum width of an element. It prevents the used value of the `width` property from becoming smaller than the value specified for `min-width`.
   * 
   * **Syntax**: `auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **7** |
   * @see https://developer.mozilla.org/docs/Web/CSS/min-width
   */
  "min-width"?: MinWidth<TLength> | undefined;
  /**
   * The **`mix-blend-mode`** CSS property sets how an element's content should blend with the content of the element's parent and the element's background.
   * 
   * **Syntax**: `<blend-mode> | plus-lighter`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **41** | **32**  | **8**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode
   */
  "mix-blend-mode"?: MixBlendMode | undefined;
  /**
   * The **`offset-distance`** CSS property specifies a position along an `offset-path` for an element to be placed.
   * 
   * **Syntax**: `<length-percentage>`
   * 
   * **Initial value**: `0`
   * 
   * |         Chrome         | Firefox | Safari | Edge | IE  |
   * | :--------------------: | :-----: | :----: | :--: | :-: |
   * |         **55**         | **72**  |   No   | n/a  | No  |
   * | 46 _(motion-distance)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-distance
   */
  "motion-distance"?: OffsetDistance<TLength> | undefined;
  /**
   * The **`offset-path`** CSS property specifies a motion path for an element to follow and defines the element's positioning within the parent container or SVG coordinate system.
   * 
   * **Syntax**: `none | ray( [ <angle> && <size> && contain? ] ) | <path()> | <url> | [ <basic-shape> || <geometry-box> ]`
   * 
   * **Initial value**: `none`
   * 
   * |       Chrome       | Firefox |  Safari  | Edge | IE  |
   * | :----------------: | :-----: | :------: | :--: | :-: |
   * |       **55**       | **72**  | **15.4** | n/a  | No  |
   * | 46 _(motion-path)_ |         |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-path
   */
  "motion-path"?: OffsetPath | undefined;
  /**
   * The **`offset-rotate`** CSS property defines the orientation/direction of the element as it is positioned along the `offset-path`.
   * 
   * **Syntax**: `[ auto | reverse ] || <angle>`
   * 
   * **Initial value**: `auto`
   * 
   * |         Chrome         | Firefox | Safari | Edge | IE  |
   * | :--------------------: | :-----: | :----: | :--: | :-: |
   * |         **56**         | **72**  |   No   | n/a  | No  |
   * | 46 _(motion-rotation)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-rotate
   */
  "motion-rotation"?: OffsetRotate | undefined;
  /**
   * The **`object-fit`** CSS property sets how the content of a replaced element, such as an `<img>` or `<video>`, should be resized to fit its container.
   * 
   * **Syntax**: `fill | contain | cover | none | scale-down`
   * 
   * **Initial value**: `fill`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **32** | **36**  | **10** | **79** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/object-fit
   */
  "object-fit"?: ObjectFit | undefined;
  /**
   * The **`object-position`** CSS property specifies the alignment of the selected replaced element's contents within the element's box. Areas of the box which aren't covered by the replaced element's object will show the element's background.
   * 
   * **Syntax**: `<position>`
   * 
   * **Initial value**: `50% 50%`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **32** | **36**  | **10** | **79** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/object-position
   */
  "object-position"?: ObjectPosition<TLength> | undefined;
  /**
   * **Syntax**: `auto | <position>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **72**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-anchor
   */
  "offset-anchor"?: OffsetAnchor<TLength> | undefined;
  /**
   * The **`offset-distance`** CSS property specifies a position along an `offset-path` for an element to be placed.
   * 
   * **Syntax**: `<length-percentage>`
   * 
   * **Initial value**: `0`
   * 
   * |         Chrome         | Firefox | Safari | Edge | IE  |
   * | :--------------------: | :-----: | :----: | :--: | :-: |
   * |         **55**         | **72**  |   No   | n/a  | No  |
   * | 46 _(motion-distance)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-distance
   */
  "offset-distance"?: OffsetDistance<TLength> | undefined;
  /**
   * The **`offset-path`** CSS property specifies a motion path for an element to follow and defines the element's positioning within the parent container or SVG coordinate system.
   * 
   * **Syntax**: `none | ray( [ <angle> && <size> && contain? ] ) | <path()> | <url> | [ <basic-shape> || <geometry-box> ]`
   * 
   * **Initial value**: `none`
   * 
   * |       Chrome       | Firefox |  Safari  | Edge | IE  |
   * | :----------------: | :-----: | :------: | :--: | :-: |
   * |       **55**       | **72**  | **15.4** | n/a  | No  |
   * | 46 _(motion-path)_ |         |          |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-path
   */
  "offset-path"?: OffsetPath | undefined;
  /**
   * The **`offset-rotate`** CSS property defines the orientation/direction of the element as it is positioned along the `offset-path`.
   * 
   * **Syntax**: `[ auto | reverse ] || <angle>`
   * 
   * **Initial value**: `auto`
   * 
   * |         Chrome         | Firefox | Safari | Edge | IE  |
   * | :--------------------: | :-----: | :----: | :--: | :-: |
   * |         **56**         | **72**  |   No   | n/a  | No  |
   * | 46 _(motion-rotation)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-rotate
   */
  "offset-rotate"?: OffsetRotate | undefined;
  /**
   * The **`offset-rotate`** CSS property defines the orientation/direction of the element as it is positioned along the `offset-path`.
   * 
   * **Syntax**: `[ auto | reverse ] || <angle>`
   * 
   * **Initial value**: `auto`
   * 
   * |         Chrome         | Firefox | Safari | Edge | IE  |
   * | :--------------------: | :-----: | :----: | :--: | :-: |
   * |         **56**         | **72**  |   No   | n/a  | No  |
   * | 46 _(motion-rotation)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset-rotate
   */
  "offset-rotation"?: OffsetRotate | undefined;
  /**
   * The **`opacity`** CSS property sets the opacity of an element. Opacity is the degree to which content behind an element is hidden, and is the opposite of transparency.
   * 
   * **Syntax**: `<alpha-value>`
   * 
   * **Initial value**: `1`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **2**  | **12** | **9** |
   * @see https://developer.mozilla.org/docs/Web/CSS/opacity
   */
  opacity?: Opacity | undefined;
  /**
   * The **`order`** CSS property sets the order to lay out an item in a flex or grid container. Items in a container are sorted by ascending `order` value and then by their source code order.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `0`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |    IE    |
   * | :------: | :-----: | :-----: | :----: | :------: |
   * |  **29**  | **20**  |  **9**  | **12** |  **11**  |
   * | 21 _-x-_ |         | 7 _-x-_ |        | 10 _-x-_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/order
   */
  order?: Order | undefined;
  /**
   * The **`orphans`** CSS property sets the minimum number of lines in a block container that must be shown at the _bottom_ of a page, region, or column.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `2`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **25** |   No    | **1.3** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/orphans
   */
  orphans?: Orphans | undefined;
  /**
   * The **`outline-color`** CSS property sets the color of an element's outline.
   * 
   * **Syntax**: `<color> | invert`
   * 
   * **Initial value**: `invert`, for browsers supporting it, `currentColor` for the other
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  | **1.5** | **1.2** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/outline-color
   */
  "outline-color"?: OutlineColor | undefined;
  /**
   * The **`outline-offset`** CSS property sets the amount of space between an outline and the edge or border of an element.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari  |  Edge  | IE  |
   * | :----: | :-----: | :-----: | :----: | :-: |
   * | **1**  | **1.5** | **1.2** | **15** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/outline-offset
   */
  "outline-offset"?: OutlineOffset<TLength> | undefined;
  /**
   * The **`outline-style`** CSS property sets the style of an element's outline. An outline is a line that is drawn around an element, outside the `border`.
   * 
   * **Syntax**: `auto | <'border-style'>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  | **1.5** | **1.2** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/outline-style
   */
  "outline-style"?: OutlineStyle | undefined;
  /**
   * The CSS **`outline-width`** property sets the thickness of an element's outline. An outline is a line that is drawn around an element, outside the `border`.
   * 
   * **Syntax**: `<line-width>`
   * 
   * **Initial value**: `medium`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  | **1.5** | **1.2** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/outline-width
   */
  "outline-width"?: OutlineWidth<TLength> | undefined;
  /**
   * **Syntax**: `auto | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **56** | **66**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-anchor
   */
  "overflow-anchor"?: OverflowAnchor | undefined;
  /**
   * **Syntax**: `visible | hidden | clip | scroll | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **69**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-block
   */
  "overflow-block"?: OverflowBlock | undefined;
  /**
   * The **`overflow-clip-box`** CSS property specifies relative to which box the clipping happens when there is an overflow. It is short hand for the `overflow-clip-box-inline` and `overflow-clip-box-block` properties.
   * 
   * **Syntax**: `padding-box | content-box`
   * 
   * **Initial value**: `padding-box`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **29**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Mozilla/Gecko/Chrome/CSS/overflow-clip-box
   */
  "overflow-clip-box"?: OverflowClipBox | undefined;
  /**
   * **Syntax**: `<visual-box> || <length [0,∞]>`
   * 
   * **Initial value**: `0px`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **90** |   No    |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-clip-margin
   */
  "overflow-clip-margin"?: OverflowClipMargin<TLength> | undefined;
  /**
   * **Syntax**: `visible | hidden | clip | scroll | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **69**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-inline
   */
  "overflow-inline"?: OverflowInline | undefined;
  /**
   * The **`overflow-wrap`** CSS property applies to inline elements, setting whether the browser should insert line breaks within an otherwise unbreakable string to prevent text from overflowing its line box.
   * 
   * **Syntax**: `normal | break-word | anywhere`
   * 
   * **Initial value**: `normal`
   * 
   * |     Chrome      |      Firefox      |     Safari      |       Edge       |          IE           |
   * | :-------------: | :---------------: | :-------------: | :--------------: | :-------------------: |
   * |     **23**      |      **49**       |      **7**      |      **18**      | **5.5** _(word-wrap)_ |
   * | 1 _(word-wrap)_ | 3.5 _(word-wrap)_ | 1 _(word-wrap)_ | 12 _(word-wrap)_ |                       |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-wrap
   */
  "overflow-wrap"?: OverflowWrap | undefined;
  /**
   * The **`overflow-x`** CSS property sets what shows when content overflows a block-level element's left and right edges. This may be nothing, a scroll bar, or the overflow content.
   * 
   * **Syntax**: `visible | hidden | clip | scroll | auto`
   * 
   * **Initial value**: `visible`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  | **3.5** | **3**  | **12** | **5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-x
   */
  "overflow-x"?: OverflowX | undefined;
  /**
   * The **`overflow-y`** CSS property sets what shows when content overflows a block-level element's top and bottom edges. This may be nothing, a scroll bar, or the overflow content.
   * 
   * **Syntax**: `visible | hidden | clip | scroll | auto`
   * 
   * **Initial value**: `visible`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  | **3.5** | **3**  | **12** | **5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow-y
   */
  "overflow-y"?: OverflowY | undefined;
  /**
   * The **`overscroll-behavior-block`** CSS property sets the browser's behavior when the block direction boundary of a scrolling area is reached.
   * 
   * **Syntax**: `contain | none | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **77** | **73**  | **16** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-block
   */
  "overscroll-behavior-block"?: OverscrollBehaviorBlock | undefined;
  /**
   * The **`overscroll-behavior-inline`** CSS property sets the browser's behavior when the inline direction boundary of a scrolling area is reached.
   * 
   * **Syntax**: `contain | none | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **77** | **73**  | **16** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-inline
   */
  "overscroll-behavior-inline"?: OverscrollBehaviorInline | undefined;
  /**
   * The **`overscroll-behavior-x`** CSS property sets the browser's behavior when the horizontal boundary of a scrolling area is reached.
   * 
   * **Syntax**: `contain | none | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **63** | **59**  | **16** | **18** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-x
   */
  "overscroll-behavior-x"?: OverscrollBehaviorX | undefined;
  /**
   * The **`overscroll-behavior-y`** CSS property sets the browser's behavior when the vertical boundary of a scrolling area is reached.
   * 
   * **Syntax**: `contain | none | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **63** | **59**  | **16** | **18** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-y
   */
  "overscroll-behavior-y"?: OverscrollBehaviorY | undefined;
  /**
   * The **`padding-block`** CSS shorthand property defines the logical block start and end padding of an element, which maps to physical padding properties depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-block
   */
  "padding-block"?: PaddingBlock<TLength> | undefined;
  /**
   * The **`padding-block-end`** CSS property defines the logical block end padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-block-end
   */
  "padding-block-end"?: PaddingBlockEnd<TLength> | undefined;
  /**
   * The **`padding-block-start`** CSS property defines the logical block start padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-block-start
   */
  "padding-block-start"?: PaddingBlockStart<TLength> | undefined;
  /**
   * The **`padding-bottom`** CSS property sets the height of the padding area on the bottom of an element.
   * 
   * **Syntax**: `<length> | <percentage>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-bottom
   */
  "padding-bottom"?: PaddingBottom<TLength> | undefined;
  /**
   * The **`padding-inline`** CSS shorthand property defines the logical inline start and end padding of an element, which maps to physical padding properties depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-inline
   */
  "padding-inline"?: PaddingInline<TLength> | undefined;
  /**
   * The **`padding-inline-end`** CSS property defines the logical inline end padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   * 
   * |          Chrome           |        Firefox         |          Safari           | Edge | IE  |
   * | :-----------------------: | :--------------------: | :-----------------------: | :--: | :-: |
   * |          **87**           |         **41**         |         **12.1**          | n/a  | No  |
   * | 2 _(-webkit-padding-end)_ | 3 _(-moz-padding-end)_ | 3 _(-webkit-padding-end)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-inline-end
   */
  "padding-inline-end"?: PaddingInlineEnd<TLength> | undefined;
  /**
   * The **`padding-inline-start`** CSS property defines the logical inline start padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   * 
   * |           Chrome            |         Firefox          |           Safari            | Edge | IE  |
   * | :-------------------------: | :----------------------: | :-------------------------: | :--: | :-: |
   * |           **87**            |          **41**          |          **12.1**           | n/a  | No  |
   * | 2 _(-webkit-padding-start)_ | 3 _(-moz-padding-start)_ | 3 _(-webkit-padding-start)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-inline-start
   */
  "padding-inline-start"?: PaddingInlineStart<TLength> | undefined;
  /**
   * The **`padding-left`** CSS property sets the width of the padding area to the left of an element.
   * 
   * **Syntax**: `<length> | <percentage>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-left
   */
  "padding-left"?: PaddingLeft<TLength> | undefined;
  /**
   * The **`padding-right`** CSS property sets the width of the padding area on the right of an element.
   * 
   * **Syntax**: `<length> | <percentage>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-right
   */
  "padding-right"?: PaddingRight<TLength> | undefined;
  /**
   * The **`padding-top`** CSS property sets the height of the padding area on the top of an element.
   * 
   * **Syntax**: `<length> | <percentage>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding-top
   */
  "padding-top"?: PaddingTop<TLength> | undefined;
  /**
   * The **`page-break-after`** CSS property adjusts page breaks _after_ the current element.
   * 
   * **Syntax**: `auto | always | avoid | left | right | recto | verso`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **1**  | **1.2** | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/page-break-after
   */
  "page-break-after"?: PageBreakAfter | undefined;
  /**
   * The **`page-break-before`** CSS property adjusts page breaks _before_ the current element.
   * 
   * **Syntax**: `auto | always | avoid | left | right | recto | verso`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **1**  | **1.2** | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/page-break-before
   */
  "page-break-before"?: PageBreakBefore | undefined;
  /**
   * The **`page-break-inside`** CSS property adjusts page breaks _inside_ the current element.
   * 
   * **Syntax**: `auto | avoid`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  | **19**  | **1.3** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/page-break-inside
   */
  "page-break-inside"?: PageBreakInside | undefined;
  /**
   * The **`paint-order`** CSS property lets you control the order in which the fill and stroke (and painting markers) of text content and shapes are drawn.
   * 
   * **Syntax**: `normal | [ fill || stroke || markers ]`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **35** | **60**  | **8**  | **17** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/paint-order
   */
  "paint-order"?: PaintOrder | undefined;
  /**
   * The **`perspective`** CSS property determines the distance between the z=0 plane and the user in order to give a 3D-positioned element some perspective.
   * 
   * **Syntax**: `none | <length>`
   * 
   * **Initial value**: `none`
   * 
   * |  Chrome  | Firefox  | Safari  |  Edge  |   IE   |
   * | :------: | :------: | :-----: | :----: | :----: |
   * |  **36**  |  **16**  |  **9**  | **12** | **10** |
   * | 12 _-x-_ | 10 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/perspective
   */
  perspective?: Perspective<TLength> | undefined;
  /**
   * The **`perspective-origin`** CSS property determines the position at which the viewer is looking. It is used as the _vanishing point_ by the `perspective` property.
   * 
   * **Syntax**: `<position>`
   * 
   * **Initial value**: `50% 50%`
   * 
   * |  Chrome  | Firefox  | Safari  |  Edge  |   IE   |
   * | :------: | :------: | :-----: | :----: | :----: |
   * |  **36**  |  **16**  |  **9**  | **12** | **10** |
   * | 12 _-x-_ | 10 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/perspective-origin
   */
  "perspective-origin"?: PerspectiveOrigin<TLength> | undefined;
  /**
   * The **`place-content`** CSS shorthand property allows you to align content along both the block and inline directions at once (i.e. the `align-content` and `justify-content` properties) in a relevant layout system such as Grid or Flexbox.
   * 
   * **Syntax**: `<'align-content'> <'justify-content'>?`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **59** | **45**  | **9**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/place-content
   */
  "place-content"?: PlaceContent | undefined;
  /**
   * The **`pointer-events`** CSS property sets under what circumstances (if any) a particular graphic element can become the target of pointer events.
   * 
   * **Syntax**: `auto | none | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | inherit`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * | **1**  | **1.5** | **4**  | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/pointer-events
   */
  "pointer-events"?: PointerEvents | undefined;
  /**
   * The **`position`** CSS property sets how an element is positioned in a document. The `top`, `right`, `bottom`, and `left` properties determine the final location of positioned elements.
   * 
   * **Syntax**: `static | relative | absolute | sticky | fixed`
   * 
   * **Initial value**: `static`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/position
   */
  position?: Position | undefined;
  /**
   * The **`print-color-adjust`** CSS property sets what, if anything, the user agent may do to optimize the appearance of the element on the output device. By default, the browser is allowed to make any adjustments to the element's appearance it determines to be necessary and prudent given the type and capabilities of the output device.
   * 
   * **Syntax**: `economy | exact`
   * 
   * **Initial value**: `economy`
   * 
   * |    Chrome    |       Firefox       |  Safari  |     Edge     | IE  |
   * | :----------: | :-----------------: | :------: | :----------: | :-: |
   * | **17** _-x-_ |       **97**        | **15.4** | **79** _-x-_ | No  |
   * |              | 48 _(color-adjust)_ | 6 _-x-_  |              |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/print-color-adjust
   */
  "print-color-adjust"?: PrintColorAdjust | undefined;
  /**
   * The **`quotes`** CSS property sets how the browser should render quotation marks that are added using the `open-quotes` or `close-quotes` values of the CSS `content` property.
   * 
   * **Syntax**: `none | auto | [ <string> <string> ]+`
   * 
   * **Initial value**: depends on user agent
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **11** | **1.5** | **9**  | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/quotes
   */
  quotes?: Quotes | undefined;
  /**
   * The **`resize`** CSS property sets whether an element is resizable, and if so, in which directions.
   * 
   * **Syntax**: `none | both | horizontal | vertical | block | inline`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **1**  |  **4**  | **3**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/resize
   */
  resize?: Resize | undefined;
  /**
   * The **`right`** CSS property participates in specifying the horizontal position of a positioned element. It has no effect on non-positioned elements.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/right
   */
  right?: Right<TLength> | undefined;
  /**
   * The **`rotate`** CSS property allows you to specify rotation transforms individually and independently of the `transform` property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the `transform` property.
   * 
   * **Syntax**: `none | <angle> | [ x | y | z | <number>{3} ] && <angle>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox |  Safari  | Edge | IE  |
   * | :-----: | :-----: | :------: | :--: | :-: |
   * | **104** | **72**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/rotate
   */
  rotate?: Rotate | undefined;
  /**
   * The **`row-gap`** CSS property sets the size of the gap (gutter) between an element's grid rows.
   * 
   * **Syntax**: `normal | <length-percentage>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **47** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/row-gap
   */
  "row-gap"?: RowGap<TLength> | undefined;
  /**
   * The **`ruby-align`** CSS property defines the distribution of the different ruby elements over the base.
   * 
   * **Syntax**: `start | center | space-between | space-around`
   * 
   * **Initial value**: `space-around`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **38**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/ruby-align
   */
  "ruby-align"?: RubyAlign | undefined;
  /**
   * **Syntax**: `separate | collapse | auto`
   * 
   * **Initial value**: `separate`
   */
  "ruby-merge"?: RubyMerge | undefined;
  /**
   * The **`ruby-position`** CSS property defines the position of a ruby element relatives to its base element. It can be positioned over the element (`over`), under it (`under`), or between the characters on their right side (`inter-character`).
   * 
   * **Syntax**: `[ alternate || [ over | under ] ] | inter-character`
   * 
   * **Initial value**: `alternate`
   * 
   * | Chrome  | Firefox |   Safari    | Edge  | IE  |
   * | :-----: | :-----: | :---------: | :---: | :-: |
   * | **84**  | **38**  | **7** _-x-_ | 12-79 | No  |
   * | 1 _-x-_ |         |             |       |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/ruby-position
   */
  "ruby-position"?: RubyPosition | undefined;
  /**
   * The **`scale`** CSS property allows you to specify scale transforms individually and independently of the `transform` property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the `transform` value.
   * 
   * **Syntax**: `none | <number>{1,3}`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox |  Safari  | Edge | IE  |
   * | :-----: | :-----: | :------: | :--: | :-: |
   * | **104** | **72**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scale
   */
  scale?: Scale | undefined;
  /**
   * The **`scroll-behavior`** CSS property sets the behavior for a scrolling box when scrolling is triggered by the navigation or CSSOM scrolling APIs.
   * 
   * **Syntax**: `auto | smooth`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **61** | **36**  | **15.4** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-behavior
   */
  "scroll-behavior"?: ScrollBehavior | undefined;
  /**
   * The **`scroll-margin`** shorthand property sets all of the scroll margins of an element at once, assigning values much like the `margin` property does for margins of an element.
   * 
   * **Syntax**: `<length>{1,4}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |          Safari           | Edge | IE  |
   * | :----: | :-----: | :-----------------------: | :--: | :-: |
   * | **69** | **90**  |         **14.1**          | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin
   */
  "scroll-margin"?: ScrollMargin<TLength> | undefined;
  /**
   * The `scroll-margin-block` shorthand property sets the scroll margins of an element in the block dimension.
   * 
   * **Syntax**: `<length>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-block
   */
  "scroll-margin-block"?: ScrollMarginBlock<TLength> | undefined;
  /**
   * The `scroll-margin-block-end` property defines the margin of the scroll snap area at the end of the block dimension that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-block-end
   */
  "scroll-margin-block-end"?: ScrollMarginBlockEnd<TLength> | undefined;
  /**
   * The `scroll-margin-block-start` property defines the margin of the scroll snap area at the start of the block dimension that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-block-start
   */
  "scroll-margin-block-start"?: ScrollMarginBlockStart<TLength> | undefined;
  /**
   * The `scroll-margin-bottom` property defines the bottom margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |              Safari              | Edge | IE  |
   * | :----: | :-----: | :------------------------------: | :--: | :-: |
   * | **69** | **68**  |             **14.1**             | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-bottom)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-bottom
   */
  "scroll-margin-bottom"?: ScrollMarginBottom<TLength> | undefined;
  /**
   * The `scroll-margin-inline` shorthand property sets the scroll margins of an element in the inline dimension.
   * 
   * **Syntax**: `<length>{1,2}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-inline
   */
  "scroll-margin-inline"?: ScrollMarginInline<TLength> | undefined;
  /**
   * The `scroll-margin-inline-end` property defines the margin of the scroll snap area at the end of the inline dimension that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-inline-end
   */
  "scroll-margin-inline-end"?: ScrollMarginInlineEnd<TLength> | undefined;
  /**
   * The `scroll-margin-inline-start` property defines the margin of the scroll snap area at the start of the inline dimension that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-inline-start
   */
  "scroll-margin-inline-start"?: ScrollMarginInlineStart<TLength> | undefined;
  /**
   * The `scroll-margin-left` property defines the left margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |             Safari             | Edge | IE  |
   * | :----: | :-----: | :----------------------------: | :--: | :-: |
   * | **69** | **68**  |            **14.1**            | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-left)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-left
   */
  "scroll-margin-left"?: ScrollMarginLeft<TLength> | undefined;
  /**
   * The `scroll-margin-right` property defines the right margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |             Safari              | Edge | IE  |
   * | :----: | :-----: | :-----------------------------: | :--: | :-: |
   * | **69** | **68**  |            **14.1**             | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-right)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-right
   */
  "scroll-margin-right"?: ScrollMarginRight<TLength> | undefined;
  /**
   * The `scroll-margin-top` property defines the top margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |            Safari             | Edge | IE  |
   * | :----: | :-----: | :---------------------------: | :--: | :-: |
   * | **69** | **68**  |           **14.1**            | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-top)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-top
   */
  "scroll-margin-top"?: ScrollMarginTop<TLength> | undefined;
  /**
   * The **`scroll-padding`** shorthand property sets scroll padding on all sides of an element at once, much like the `padding` property does for padding on an element.
   * 
   * **Syntax**: `[ auto | <length-percentage> ]{1,4}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding
   */
  "scroll-padding"?: ScrollPadding<TLength> | undefined;
  /**
   * The `scroll-padding-block` shorthand property sets the scroll padding of an element in the block dimension.
   * 
   * **Syntax**: `[ auto | <length-percentage> ]{1,2}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-block
   */
  "scroll-padding-block"?: ScrollPaddingBlock<TLength> | undefined;
  /**
   * The `scroll-padding-block-end` property defines offsets for the end edge in the block dimension of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-block-end
   */
  "scroll-padding-block-end"?: ScrollPaddingBlockEnd<TLength> | undefined;
  /**
   * The `scroll-padding-block-start` property defines offsets for the start edge in the block dimension of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-block-start
   */
  "scroll-padding-block-start"?: ScrollPaddingBlockStart<TLength> | undefined;
  /**
   * The `scroll-padding-bottom` property defines offsets for the bottom of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-bottom
   */
  "scroll-padding-bottom"?: ScrollPaddingBottom<TLength> | undefined;
  /**
   * The `scroll-padding-inline` shorthand property sets the scroll padding of an element in the inline dimension.
   * 
   * **Syntax**: `[ auto | <length-percentage> ]{1,2}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-inline
   */
  "scroll-padding-inline"?: ScrollPaddingInline<TLength> | undefined;
  /**
   * The `scroll-padding-inline-end` property defines offsets for the end edge in the inline dimension of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-inline-end
   */
  "scroll-padding-inline-end"?: ScrollPaddingInlineEnd<TLength> | undefined;
  /**
   * The `scroll-padding-inline-start` property defines offsets for the start edge in the inline dimension of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-inline-start
   */
  "scroll-padding-inline-start"?: ScrollPaddingInlineStart<TLength> | undefined;
  /**
   * The `scroll-padding-left` property defines offsets for the left of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-left
   */
  "scroll-padding-left"?: ScrollPaddingLeft<TLength> | undefined;
  /**
   * The `scroll-padding-right` property defines offsets for the right of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-right
   */
  "scroll-padding-right"?: ScrollPaddingRight<TLength> | undefined;
  /**
   * The **`scroll-padding-top`** property defines offsets for the top of the _optimal viewing region_ of the scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars) or to put more breathing room between a targeted element and the edges of the scrollport.
   * 
   * **Syntax**: `auto | <length-percentage>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **68**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-padding-top
   */
  "scroll-padding-top"?: ScrollPaddingTop<TLength> | undefined;
  /**
   * The `scroll-snap-align` property specifies the box's snap position as an alignment of its snap area (as the alignment subject) within its snap container's snapport (as the alignment container). The two values specify the snapping alignment in the block axis and inline axis, respectively. If only one value is specified, the second value defaults to the same value.
   * 
   * **Syntax**: `[ none | start | end | center ]{1,2}`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **69** | **68**  | **11** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-snap-align
   */
  "scroll-snap-align"?: ScrollSnapAlign | undefined;
  /**
   * The **`scroll-margin`** shorthand property sets all of the scroll margins of an element at once, assigning values much like the `margin` property does for margins of an element.
   * 
   * **Syntax**: `<length>{1,4}`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |          Safari           | Edge | IE  |
   * | :----: | :-----: | :-----------------------: | :--: | :-: |
   * | **69** |  68-90  |         **14.1**          | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin
   */
  "scroll-snap-margin"?: ScrollMargin<TLength> | undefined;
  /**
   * The `scroll-margin-bottom` property defines the bottom margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |              Safari              | Edge | IE  |
   * | :----: | :-----: | :------------------------------: | :--: | :-: |
   * | **69** | **68**  |             **14.1**             | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-bottom)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-bottom
   */
  "scroll-snap-margin-bottom"?: ScrollMarginBottom<TLength> | undefined;
  /**
   * The `scroll-margin-left` property defines the left margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |             Safari             | Edge | IE  |
   * | :----: | :-----: | :----------------------------: | :--: | :-: |
   * | **69** | **68**  |            **14.1**            | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-left)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-left
   */
  "scroll-snap-margin-left"?: ScrollMarginLeft<TLength> | undefined;
  /**
   * The `scroll-margin-right` property defines the right margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |             Safari              | Edge | IE  |
   * | :----: | :-----: | :-----------------------------: | :--: | :-: |
   * | **69** | **68**  |            **14.1**             | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-right)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-right
   */
  "scroll-snap-margin-right"?: ScrollMarginRight<TLength> | undefined;
  /**
   * The `scroll-margin-top` property defines the top margin of the scroll snap area that is used for snapping this box to the snapport. The scroll snap area is determined by taking the transformed border box, finding its rectangular bounding box (axis-aligned in the scroll container's coordinate space), then adding the specified outsets.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |            Safari             | Edge | IE  |
   * | :----: | :-----: | :---------------------------: | :--: | :-: |
   * | **69** | **68**  |           **14.1**            | n/a  | No  |
   * |        |         | 11 _(scroll-snap-margin-top)_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-margin-top
   */
  "scroll-snap-margin-top"?: ScrollMarginTop<TLength> | undefined;
  /**
   * The **`scroll-snap-stop`** CSS property defines whether the scroll container is allowed to "pass over" possible snap positions.
   * 
   * **Syntax**: `normal | always`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **75** | **103** | **15** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-snap-stop
   */
  "scroll-snap-stop"?: ScrollSnapStop | undefined;
  /**
   * The **`scroll-snap-type`** CSS property sets how strictly snap points are enforced on the scroll container in case there is one.
   * 
   * **Syntax**: `none | [ x | y | block | inline | both ] [ mandatory | proximity ]?`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |      IE      |
   * | :----: | :-----: | :-----: | :----: | :----------: |
   * | **69** |  39-68  | **11**  | **79** | **10** _-x-_ |
   * |        |         | 9 _-x-_ |        |              |
   * @see https://developer.mozilla.org/docs/Web/CSS/scroll-snap-type
   */
  "scroll-snap-type"?: ScrollSnapType | undefined;
  /**
   * The **`scrollbar-color`** CSS property sets the color of the scrollbar track and thumb.
   * 
   * **Syntax**: `auto | <color>{2}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **64**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scrollbar-color
   */
  "scrollbar-color"?: ScrollbarColor | undefined;
  /**
   * The **`scrollbar-gutter`** CSS property allows authors to reserve space for the scrollbar, preventing unwanted layout changes as the content grows while also avoiding unnecessary visuals when scrolling isn't needed.
   * 
   * **Syntax**: `auto | stable && both-edges?`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **94** | **97**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scrollbar-gutter
   */
  "scrollbar-gutter"?: ScrollbarGutter | undefined;
  /**
   * The **`scrollbar-width`** property allows the author to set the maximum thickness of an element's scrollbars when they are shown.
   * 
   * **Syntax**: `auto | thin | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * |   No   | **64**  |   No   | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/scrollbar-width
   */
  "scrollbar-width"?: ScrollbarWidth | undefined;
  /**
   * The **`shape-image-threshold`** CSS property sets the alpha channel threshold used to extract the shape using an image as the value for `shape-outside`.
   * 
   * **Syntax**: `<alpha-value>`
   * 
   * **Initial value**: `0.0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **37** | **62**  | **10.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/shape-image-threshold
   */
  "shape-image-threshold"?: ShapeImageThreshold | undefined;
  /**
   * The **`shape-margin`** CSS property sets a margin for a CSS shape created using `shape-outside`.
   * 
   * **Syntax**: `<length-percentage>`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **37** | **62**  | **10.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/shape-margin
   */
  "shape-margin"?: ShapeMargin<TLength> | undefined;
  /**
   * The **`shape-outside`** CSS property defines a shape—which may be non-rectangular—around which adjacent inline content should wrap. By default, inline content wraps around its margin box; `shape-outside` provides a way to customize this wrapping, making it possible to wrap text around complex objects rather than simple boxes.
   * 
   * **Syntax**: `none | [ <shape-box> || <basic-shape> ] | <image>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **37** | **62**  | **10.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/shape-outside
   */
  "shape-outside"?: ShapeOutside | undefined;
  /**
   * The **`tab-size`** CSS property is used to customize the width of tab characters (U+0009).
   * 
   * **Syntax**: `<integer> | <length>`
   * 
   * **Initial value**: `8`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **21** | **91**  | **7**  | n/a  | No  |
   * |        | 4 _-x-_ |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/tab-size
   */
  "tab-size"?: TabSize<TLength> | undefined;
  /**
   * The **`table-layout`** CSS property sets the algorithm used to lay out `<table>` cells, rows, and columns.
   * 
   * **Syntax**: `auto | fixed`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **14** |  **1**  | **1**  | **12** | **5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/table-layout
   */
  "table-layout"?: TableLayout | undefined;
  /**
   * The **`text-align`** CSS property sets the horizontal alignment of the content inside a block element or table-cell box. This means it works like `vertical-align` but in the horizontal direction.
   * 
   * **Syntax**: `start | end | left | right | center | justify | match-parent`
   * 
   * **Initial value**: `start`, or a nameless value that acts as `left` if _direction_ is `ltr`, `right` if _direction_ is `rtl` if `start` is not supported by the browser.
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-align
   */
  "text-align"?: TextAlign | undefined;
  /**
   * The **`text-align-last`** CSS property sets how the last line of a block or a line, right before a forced line break, is aligned.
   * 
   * **Syntax**: `auto | start | end | left | right | center | justify`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **47** | **49**  | **16** | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-align-last
   */
  "text-align-last"?: TextAlignLast | undefined;
  /**
   * The **`text-combine-upright`** CSS property sets the combination of characters into the space of a single character. If the combined text is wider than 1em, the user agent must fit the contents within 1em. The resulting composition is treated as a single upright glyph for layout and decoration. This property only has an effect in vertical writing modes.
   * 
   * **Syntax**: `none | all | [ digits <integer>? ]`
   * 
   * **Initial value**: `none`
   * 
   * |           Chrome           | Firefox |              Safari              | Edge  |                   IE                   |
   * | :------------------------: | :-----: | :------------------------------: | :---: | :------------------------------------: |
   * |           **48**           | **48**  | **5.1** _(-webkit-text-combine)_ | 15-79 | **11** _(-ms-text-combine-horizontal)_ |
   * | 9 _(-webkit-text-combine)_ |         |                                  |       |                                        |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-combine-upright
   */
  "text-combine-upright"?: TextCombineUpright | undefined;
  /**
   * The **`text-decoration-color`** CSS property sets the color of decorations added to text by `text-decoration-line`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **36**  | **12.1** | n/a  | No  |
   * |        |         | 8 _-x-_  |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-color
   */
  "text-decoration-color"?: TextDecorationColor | undefined;
  /**
   * The **`text-decoration-line`** CSS property sets the kind of decoration that is used on text in an element, such as an underline or overline.
   * 
   * **Syntax**: `none | [ underline || overline || line-through || blink ] | spelling-error | grammar-error`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **36**  | **12.1** | n/a  | No  |
   * |        |         | 8 _-x-_  |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-line
   */
  "text-decoration-line"?: TextDecorationLine | undefined;
  /**
   * The **`text-decoration-skip`** CSS property sets what parts of an element's content any text decoration affecting the element must skip over. It controls all text decoration lines drawn by the element and also any text decoration lines drawn by its ancestors.
   * 
   * **Syntax**: `none | [ objects || [ spaces | [ leading-spaces || trailing-spaces ] ] || edges || box-decoration ]`
   * 
   * **Initial value**: `objects`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | 57-64  |   No    | **12.1** | n/a  | No  |
   * |        |         | 7 _-x-_  |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-skip
   */
  "text-decoration-skip"?: TextDecorationSkip | undefined;
  /**
   * The **`text-decoration-skip-ink`** CSS property specifies how overlines and underlines are drawn when they pass over glyph ascenders and descenders.
   * 
   * **Syntax**: `auto | all | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **64** | **70**  | **15.4** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-skip-ink
   */
  "text-decoration-skip-ink"?: TextDecorationSkipInk | undefined;
  /**
   * The **`text-decoration-style`** CSS property sets the style of the lines specified by `text-decoration-line`. The style applies to all lines that are set with `text-decoration-line`.
   * 
   * **Syntax**: `solid | double | dotted | dashed | wavy`
   * 
   * **Initial value**: `solid`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **57** | **36**  | **12.1** | n/a  | No  |
   * |        |         | 8 _-x-_  |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-style
   */
  "text-decoration-style"?: TextDecorationStyle | undefined;
  /**
   * The **`text-decoration-thickness`** CSS property sets the stroke thickness of the decoration line that is used on text in an element, such as a line-through, underline, or overline.
   * 
   * **Syntax**: `auto | from-font | <length> | <percentage> `
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **89** | **70**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-thickness
   */
  "text-decoration-thickness"?: TextDecorationThickness<TLength> | undefined;
  /**
   * The **`text-emphasis-color`** CSS property sets the color of emphasis marks. This value can also be set using the `text-emphasis` shorthand.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   * 
   * |  Chrome  | Firefox | Safari | Edge | IE  |
   * | :------: | :-----: | :----: | :--: | :-: |
   * |  **99**  | **46**  | **7**  | n/a  | No  |
   * | 25 _-x-_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis-color
   */
  "text-emphasis-color"?: TextEmphasisColor | undefined;
  /**
   * The **`text-emphasis-position`** CSS property sets where emphasis marks are drawn. Like ruby text, if there isn't enough room for emphasis marks, the line height is increased.
   * 
   * **Syntax**: `[ over | under ] && [ right | left ]`
   * 
   * **Initial value**: `over right`
   * 
   * |  Chrome  | Firefox | Safari | Edge | IE  |
   * | :------: | :-----: | :----: | :--: | :-: |
   * |  **99**  | **46**  | **7**  | n/a  | No  |
   * | 25 _-x-_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis-position
   */
  "text-emphasis-position"?: TextEmphasisPosition | undefined;
  /**
   * The **`text-emphasis-style`** CSS property sets the appearance of emphasis marks. It can also be set, and reset, using the `text-emphasis` shorthand.
   * 
   * **Syntax**: `none | [ [ filled | open ] || [ dot | circle | double-circle | triangle | sesame ] ] | <string>`
   * 
   * **Initial value**: `none`
   * 
   * |  Chrome  | Firefox | Safari | Edge | IE  |
   * | :------: | :-----: | :----: | :--: | :-: |
   * |  **99**  | **46**  | **7**  | n/a  | No  |
   * | 25 _-x-_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis-style
   */
  "text-emphasis-style"?: TextEmphasisStyle | undefined;
  /**
   * The **`text-indent`** CSS property sets the length of empty space (indentation) that is put before lines of text in a block.
   * 
   * **Syntax**: `<length-percentage> && hanging? && each-line?`
   * 
   * **Initial value**: `0`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-indent
   */
  "text-indent"?: TextIndent<TLength> | undefined;
  /**
   * The **`text-justify`** CSS property sets what type of justification should be applied to text when `text-align``: justify;` is set on an element.
   * 
   * **Syntax**: `auto | inter-character | inter-word | none`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE   |
   * | :----: | :-----: | :----: | :----: | :----: |
   * |  n/a   | **55**  |   No   | **12** | **11** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-justify
   */
  "text-justify"?: TextJustify | undefined;
  /**
   * The **`text-orientation`** CSS property sets the orientation of the text characters in a line. It only affects text in vertical mode (when `writing-mode` is not `horizontal-tb`). It is useful for controlling the display of languages that use vertical script, and also for making vertical table headers.
   * 
   * **Syntax**: `mixed | upright | sideways`
   * 
   * **Initial value**: `mixed`
   * 
   * |  Chrome  | Firefox |  Safari   | Edge | IE  |
   * | :------: | :-----: | :-------: | :--: | :-: |
   * |  **48**  | **41**  |  **14**   | n/a  | No  |
   * | 11 _-x-_ |         | 5.1 _-x-_ |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-orientation
   */
  "text-orientation"?: TextOrientation | undefined;
  /**
   * The **`text-overflow`** CSS property sets how hidden overflow content is signaled to users. It can be clipped, display an ellipsis ('`…`'), or display a custom string.
   * 
   * **Syntax**: `[ clip | ellipsis | <string> ]{1,2}`
   * 
   * **Initial value**: `clip`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  |  **7**  | **1.3** | **12** | **6** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-overflow
   */
  "text-overflow"?: TextOverflow | undefined;
  /**
   * The **`text-rendering`** CSS property provides information to the rendering engine about what to optimize for when rendering text.
   * 
   * **Syntax**: `auto | optimizeSpeed | optimizeLegibility | geometricPrecision`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **4**  |  **1**  | **5**  | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-rendering
   */
  "text-rendering"?: TextRendering | undefined;
  /**
   * The **`text-shadow`** CSS property adds shadows to text. It accepts a comma-separated list of shadows to be applied to the text and any of its `decorations`. Each shadow is described by some combination of X and Y offsets from the element, blur radius, and color.
   * 
   * **Syntax**: `none | <shadow-t>#`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |   IE   |
   * | :----: | :-----: | :-----: | :----: | :----: |
   * | **2**  | **3.5** | **1.1** | **12** | **10** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-shadow
   */
  "text-shadow"?: TextShadow | undefined;
  /**
   * The **`text-size-adjust`** CSS property controls the text inflation algorithm used on some smartphones and tablets. Other browsers will ignore this property.
   * 
   * **Syntax**: `none | auto | <percentage>`
   * 
   * **Initial value**: `auto` for smartphone browsers supporting inflation, `none` in other cases (and then not modifiable).
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **54** |   No    |   No   | **79** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-size-adjust
   */
  "text-size-adjust"?: TextSizeAdjust | undefined;
  /**
   * The **`text-transform`** CSS property specifies how to capitalize an element's text. It can be used to make text appear in all-uppercase or all-lowercase, or with each word capitalized. It also can help improve legibility for ruby.
   * 
   * **Syntax**: `none | capitalize | uppercase | lowercase | full-width | full-size-kana`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-transform
   */
  "text-transform"?: TextTransform | undefined;
  /**
   * The **`text-underline-offset`** CSS property sets the offset distance of an underline text decoration line (applied using `text-decoration`) from its original position.
   * 
   * **Syntax**: `auto | <length> | <percentage> `
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **70**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-underline-offset
   */
  "text-underline-offset"?: TextUnderlineOffset<TLength> | undefined;
  /**
   * The **`text-underline-position`** CSS property specifies the position of the underline which is set using the `text-decoration` property's `underline` value.
   * 
   * **Syntax**: `auto | from-font | [ under || [ left | right ] ]`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :------: | :----: | :---: |
   * | **33** | **74**  | **12.1** | **12** | **6** |
   * |        |         | 9 _-x-_  |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-underline-position
   */
  "text-underline-position"?: TextUnderlinePosition | undefined;
  /**
   * The **`top`** CSS property participates in specifying the vertical position of a positioned element. It has no effect on non-positioned elements.
   * 
   * **Syntax**: `<length> | <percentage> | auto`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/top
   */
  top?: Top<TLength> | undefined;
  /**
   * The **`touch-action`** CSS property sets how an element's region can be manipulated by a touchscreen user (for example, by zooming features built into the browser).
   * 
   * **Syntax**: `auto | none | [ [ pan-x | pan-left | pan-right ] || [ pan-y | pan-up | pan-down ] || pinch-zoom ] | manipulation`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |    IE    |
   * | :----: | :-----: | :----: | :----: | :------: |
   * | **36** | **52**  | **13** | **12** |  **11**  |
   * |        |         |        |        | 10 _-x-_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/touch-action
   */
  "touch-action"?: TouchAction | undefined;
  /**
   * The **`transform`** CSS property lets you rotate, scale, skew, or translate an element. It modifies the coordinate space of the CSS visual formatting model.
   * 
   * **Syntax**: `none | <transform-list>`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |   IE    |
   * | :-----: | :-----: | :-------: | :----: | :-----: |
   * | **36**  | **16**  |   **9**   | **12** | **10**  |
   * | 1 _-x-_ |         | 3.1 _-x-_ |        | 9 _-x-_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/transform
   */
  transform?: Transform | undefined;
  /**
   * The **`transform-box`** CSS property defines the layout box to which the `transform` and `transform-origin` properties relate.
   * 
   * **Syntax**: `content-box | border-box | fill-box | stroke-box | view-box`
   * 
   * **Initial value**: `view-box`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **64** | **55**  | **11** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/transform-box
   */
  "transform-box"?: TransformBox | undefined;
  /**
   * The **`transform-origin`** CSS property sets the origin for an element's transformations.
   * 
   * **Syntax**: `[ <length-percentage> | left | center | right | top | bottom ] | [ [ <length-percentage> | left | center | right ] && [ <length-percentage> | top | center | bottom ] ] <length>?`
   * 
   * **Initial value**: `50% 50% 0`
   * 
   * | Chrome  |  Firefox  | Safari  |  Edge  |   IE    |
   * | :-----: | :-------: | :-----: | :----: | :-----: |
   * | **36**  |  **16**   |  **9**  | **12** | **10**  |
   * | 1 _-x-_ | 3.5 _-x-_ | 2 _-x-_ |        | 9 _-x-_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/transform-origin
   */
  "transform-origin"?: TransformOrigin<TLength> | undefined;
  /**
   * The **`transform-style`** CSS property sets whether children of an element are positioned in the 3D space or are flattened in the plane of the element.
   * 
   * **Syntax**: `flat | preserve-3d`
   * 
   * **Initial value**: `flat`
   * 
   * |  Chrome  | Firefox  | Safari  |  Edge  | IE  |
   * | :------: | :------: | :-----: | :----: | :-: |
   * |  **36**  |  **16**  |  **9**  | **12** | No  |
   * | 12 _-x-_ | 10 _-x-_ | 4 _-x-_ |        |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/transform-style
   */
  "transform-style"?: TransformStyle | undefined;
  /**
   * The **`transition-delay`** CSS property specifies the duration to wait before starting a property's transition effect when its value changes.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **26**  | **16**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ | 4 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/transition-delay
   */
  "transition-delay"?: TransitionDelay<TTime> | undefined;
  /**
   * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
   * | :-----: | :-----: | :-------: | :----: | :----: |
   * | **26**  | **16**  |   **9**   | **12** | **10** |
   * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/transition-duration
   */
  "transition-duration"?: TransitionDuration<TTime> | undefined;
  /**
   * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
   * 
   * **Syntax**: `none | <single-transition-property>#`
   * 
   * **Initial value**: all
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
   * | :-----: | :-----: | :-------: | :----: | :----: |
   * | **26**  | **16**  |   **9**   | **12** | **10** |
   * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/transition-property
   */
  "transition-property"?: TransitionProperty | undefined;
  /**
   * The **`transition-timing-function`** CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
   * | :-----: | :-----: | :-------: | :----: | :----: |
   * | **26**  | **16**  |   **9**   | **12** | **10** |
   * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/transition-timing-function
   */
  "transition-timing-function"?: TransitionTimingFunction | undefined;
  /**
   * The **`translate`** CSS property allows you to specify translation transforms individually and independently of the `transform` property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the `transform` value.
   * 
   * **Syntax**: `none | <length-percentage> [ <length-percentage> <length>? ]?`
   * 
   * **Initial value**: `none`
   * 
   * | Chrome  | Firefox |  Safari  | Edge | IE  |
   * | :-----: | :-----: | :------: | :--: | :-: |
   * | **104** | **72**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/translate
   */
  translate?: Translate<TLength> | undefined;
  /**
   * The **`unicode-bidi`** CSS property, together with the `direction` property, determines how bidirectional text in a document is handled. For example, if a block of content contains both left-to-right and right-to-left text, the user-agent uses a complex Unicode algorithm to decide how to display the text. The `unicode-bidi` property overrides this algorithm and allows the developer to control the text embedding.
   * 
   * **Syntax**: `normal | embed | isolate | bidi-override | isolate-override | plaintext`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |   IE    |
   * | :----: | :-----: | :-----: | :----: | :-----: |
   * | **2**  |  **1**  | **1.3** | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/unicode-bidi
   */
  "unicode-bidi"?: UnicodeBidi | undefined;
  /**
   * The **`user-select`** CSS property controls whether the user can select text. This doesn't have any effect on content loaded as part of a browser's user interface (its chrome), except in textboxes.
   * 
   * **Syntax**: `auto | text | none | contain | all`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome  | Firefox |   Safari    |   Edge   |      IE      |
   * | :-----: | :-----: | :---------: | :------: | :----------: |
   * | **54**  | **69**  | **3** _-x-_ |  **79**  | **10** _-x-_ |
   * | 1 _-x-_ | 1 _-x-_ |             | 12 _-x-_ |              |
   * @see https://developer.mozilla.org/docs/Web/CSS/user-select
   */
  "user-select"?: UserSelect | undefined;
  /**
   * The **`vertical-align`** CSS property sets vertical alignment of an inline, inline-block or table-cell box.
   * 
   * **Syntax**: `baseline | sub | super | text-top | text-bottom | middle | top | bottom | <percentage> | <length>`
   * 
   * **Initial value**: `baseline`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/vertical-align
   */
  "vertical-align"?: VerticalAlign<TLength> | undefined;
  /**
   * The **`visibility`** CSS property shows or hides an element without changing the layout of a document. The property can also hide rows or columns in a `<table>`.
   * 
   * **Syntax**: `visible | hidden | collapse`
   * 
   * **Initial value**: `visible`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/visibility
   */
  visibility?: Visibility | undefined;
  /**
   * The **`white-space`** CSS property sets how white space inside an element is handled.
   * 
   * **Syntax**: `normal | pre | nowrap | pre-wrap | pre-line | break-spaces`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/white-space
   */
  "white-space"?: WhiteSpace | undefined;
  /**
   * The **`widows`** CSS property sets the minimum number of lines in a block container that must be shown at the _top_ of a page, region, or column.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `2`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **25** |   No    | **1.3** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/widows
   */
  widows?: Widows | undefined;
  /**
   * The **`width`** CSS property sets an element's width. By default, it sets the width of the content area, but if `box-sizing` is set to `border-box`, it sets the width of the border area.
   * 
   * **Syntax**: `auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/width
   */
  width?: Width<TLength> | undefined;
  /**
   * The **`will-change`** CSS property hints to browsers how an element is expected to change. Browsers may set up optimizations before an element is actually changed. These kinds of optimizations can increase the responsiveness of a page by doing potentially expensive work before they are actually required.
   * 
   * **Syntax**: `auto | <animateable-feature>#`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * | **36** | **36**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/will-change
   */
  "will-change"?: WillChange | undefined;
  /**
   * The **`word-break`** CSS property sets whether line breaks appear wherever the text would otherwise overflow its content box.
   * 
   * **Syntax**: `normal | break-all | keep-all | break-word`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  | **15**  | **3**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/word-break
   */
  "word-break"?: WordBreak | undefined;
  /**
   * The **`word-spacing`** CSS property sets the length of space between words and between tags.
   * 
   * **Syntax**: `normal | <length>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **6** |
   * @see https://developer.mozilla.org/docs/Web/CSS/word-spacing
   */
  "word-spacing"?: WordSpacing<TLength> | undefined;
  /**
   * The **`overflow-wrap`** CSS property applies to inline elements, setting whether the browser should insert line breaks within an otherwise unbreakable string to prevent text from overflowing its line box.
   * 
   * **Syntax**: `normal | break-word`
   * 
   * **Initial value**: `normal`
   */
  "word-wrap"?: WordWrap | undefined;
  /**
   * The **`writing-mode`** CSS property sets whether lines of text are laid out horizontally or vertically, as well as the direction in which blocks progress. When set for an entire document, it should be set on the root element (`html` element for HTML documents).
   * 
   * **Syntax**: `horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr`
   * 
   * **Initial value**: `horizontal-tb`
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |  IE   |
   * | :-----: | :-----: | :-------: | :----: | :---: |
   * | **48**  | **41**  | **10.1**  | **12** | **9** |
   * | 8 _-x-_ |         | 5.1 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/writing-mode
   */
  "writing-mode"?: WritingMode | undefined;
  /**
   * The **`z-index`** CSS property sets the z-order of a positioned element and its descendants or flex items. Overlapping elements with a larger z-index cover those with a smaller one.
   * 
   * **Syntax**: `auto | <integer>`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/z-index
   */
  "z-index"?: ZIndex | undefined;
  /**
   * The non-standard **_`zoom`_** CSS property can be used to control the magnification level of an element. `transform: scale()` should be used instead of this property, if possible. However, unlike CSS Transforms, `zoom` affects the layout size of the element.
   * 
   * **Syntax**: `normal | reset | <number> | <percentage>`
   * 
   * **Initial value**: `normal`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |   IE    |
   * | :----: | :-----: | :-----: | :----: | :-----: |
   * | **1**  |   No    | **3.1** | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/zoom
   */
  zoom?: Zoom | undefined;
}

export interface StandardShorthandPropertiesHyphen<TLength = (string & {}) | 0, TTime = string & {}> {
  /**
   * The **`all`** shorthand CSS property resets all of an element's properties except `unicode-bidi`, `direction`, and CSS Custom Properties. It can set properties to their initial or inherited values, or to the values specified in another stylesheet origin.
   * 
   * **Syntax**: `initial | inherit | unset | revert | revert-layer`
   * 
   * **Initial value**: There is no practical initial value for it.
   * 
   * | Chrome | Firefox | Safari  | Edge | IE  |
   * | :----: | :-----: | :-----: | :--: | :-: |
   * | **37** | **27**  | **9.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/all
   */
  all?: All | undefined;
  /**
   * The **`animation`** shorthand CSS property applies an animation between styles. It is a shorthand for `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`, and `animation-play-state`.
   * 
   * **Syntax**: `<single-animation>#`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **43**  | **16**  |  **9**  | **12** | **10** |
   * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/animation
   */
  animation?: Animation<TTime> | undefined;
  /**
   * The **`background`** shorthand CSS property sets all background style properties at once, such as color, image, origin and size, or repeat method.
   * 
   * **Syntax**: `[ <bg-layer> , ]* <final-bg-layer>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background
   */
  background?: Background<TLength> | undefined;
  /**
   * The **`background-position`** CSS property sets the initial position for each background image. The position is relative to the position layer set by `background-origin`.
   * 
   * **Syntax**: `<bg-position>#`
   * 
   * **Initial value**: `0% 0%`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/background-position
   */
  "background-position"?: BackgroundPosition<TLength> | undefined;
  /**
   * The **`border`** shorthand CSS property sets an element's border. It sets the values of `border-width`, `border-style`, and `border-color`.
   * 
   * **Syntax**: `<line-width> || <line-style> || <color>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border
   */
  border?: Border<TLength> | undefined;
  /**
   * The **`border-block`** CSS property is a shorthand property for setting the individual logical block border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-top-width'> || <'border-top-style'> || <color>`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block
   */
  "border-block"?: BorderBlock<TLength> | undefined;
  /**
   * The **`border-block-end`** CSS property is a shorthand property for setting the individual logical block-end border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-top-width'> || <'border-top-style'> || <color>`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-end
   */
  "border-block-end"?: BorderBlockEnd<TLength> | undefined;
  /**
   * The **`border-block-start`** CSS property is a shorthand property for setting the individual logical block-start border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-top-width'> || <'border-top-style'> || <color>`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-block-start
   */
  "border-block-start"?: BorderBlockStart<TLength> | undefined;
  /**
   * The **`border-bottom`** shorthand CSS property sets an element's bottom border. It sets the values of `border-bottom-width`, `border-bottom-style` and `border-bottom-color`.
   * 
   * **Syntax**: `<line-width> || <line-style> || <color>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom
   */
  "border-bottom"?: BorderBottom<TLength> | undefined;
  /**
   * The **`border-color`** shorthand CSS property sets the color of an element's border.
   * 
   * **Syntax**: `<color>{1,4}`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-color
   */
  "border-color"?: BorderColor | undefined;
  /**
   * The **`border-image`** CSS property draws an image around a given element. It replaces the element's regular border.
   * 
   * **Syntax**: `<'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>`
   * 
   * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
   * | :-----: | :-------: | :-----: | :----: | :----: |
   * | **16**  |  **15**   |  **6**  | **12** | **11** |
   * | 7 _-x-_ | 3.5 _-x-_ | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-image
   */
  "border-image"?: BorderImage | undefined;
  /**
   * The **`border-inline`** CSS property is a shorthand property for setting the individual logical inline border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-top-width'> || <'border-top-style'> || <color>`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **87** | **66**  | **14.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline
   */
  "border-inline"?: BorderInline<TLength> | undefined;
  /**
   * The **`border-inline-end`** CSS property is a shorthand property for setting the individual logical inline-end border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-top-width'> || <'border-top-style'> || <color>`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end
   */
  "border-inline-end"?: BorderInlineEnd<TLength> | undefined;
  /**
   * The **`border-inline-start`** CSS property is a shorthand property for setting the individual logical inline-start border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-top-width'> || <'border-top-style'> || <color>`
   * 
   * | Chrome | Firefox |  Safari  | Edge | IE  |
   * | :----: | :-----: | :------: | :--: | :-: |
   * | **69** | **41**  | **12.1** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-start
   */
  "border-inline-start"?: BorderInlineStart<TLength> | undefined;
  /**
   * The **`border-left`** shorthand CSS property sets all the properties of an element's left border.
   * 
   * **Syntax**: `<line-width> || <line-style> || <color>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-left
   */
  "border-left"?: BorderLeft<TLength> | undefined;
  /**
   * The **`border-radius`** CSS property rounds the corners of an element's outer border edge. You can set a single radius to make circular corners, or two radii to make elliptical corners.
   * 
   * **Syntax**: `<length-percentage>{1,4} [ / <length-percentage>{1,4} ]?`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
   * | :-----: | :-----: | :-----: | :----: | :---: |
   * |  **4**  |  **4**  |  **5**  | **12** | **9** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |       |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-radius
   */
  "border-radius"?: BorderRadius<TLength> | undefined;
  /**
   * The **`border-right`** shorthand CSS property sets all the properties of an element's right border.
   * 
   * **Syntax**: `<line-width> || <line-style> || <color>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |   IE    |
   * | :----: | :-----: | :----: | :----: | :-----: |
   * | **1**  |  **1**  | **1**  | **12** | **5.5** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-right
   */
  "border-right"?: BorderRight<TLength> | undefined;
  /**
   * The **`border-style`** shorthand CSS property sets the line style for all four sides of an element's border.
   * 
   * **Syntax**: `<line-style>{1,4}`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-style
   */
  "border-style"?: BorderStyle | undefined;
  /**
   * The **`border-top`** shorthand CSS property sets all the properties of an element's top border.
   * 
   * **Syntax**: `<line-width> || <line-style> || <color>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-top
   */
  "border-top"?: BorderTop<TLength> | undefined;
  /**
   * The **`border-width`** shorthand CSS property sets the width of an element's border.
   * 
   * **Syntax**: `<line-width>{1,4}`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/border-width
   */
  "border-width"?: BorderWidth<TLength> | undefined;
  /**
   * The **`column-rule`** shorthand CSS property sets the width, style, and color of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>`
   * 
   * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :-----: | :-----: | :-----: | :----: | :----: |
   * | **50**  | **52**  |  **9**  | **12** | **10** |
   * | 1 _-x-_ |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/column-rule
   */
  "column-rule"?: ColumnRule<TLength> | undefined;
  /**
   * The **`columns`** CSS shorthand property sets the number of columns to use when drawing an element's contents, as well as those columns' widths.
   * 
   * **Syntax**: `<'column-width'> || <'column-count'>`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |   IE   |
   * | :----: | :-----: | :-----: | :----: | :----: |
   * | **50** | **52**  |  **9**  | **12** | **10** |
   * |        |         | 3 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/columns
   */
  columns?: Columns<TLength> | undefined;
  /**
   * The **`flex`** CSS shorthand property sets how a flex _item_ will grow or shrink to fit the space available in its flex container.
   * 
   * **Syntax**: `none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |    IE    |
   * | :------: | :-----: | :-----: | :----: | :------: |
   * |  **29**  | **20**  |  **9**  | **12** |  **11**  |
   * | 21 _-x-_ |         | 7 _-x-_ |        | 10 _-x-_ |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex
   */
  flex?: Flex<TLength> | undefined;
  /**
   * The **`flex-flow`** CSS shorthand property specifies the direction of a flex container, as well as its wrapping behavior.
   * 
   * **Syntax**: `<'flex-direction'> || <'flex-wrap'>`
   * 
   * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
   * | :------: | :-----: | :-----: | :----: | :----: |
   * |  **29**  | **28**  |  **9**  | **12** | **11** |
   * | 21 _-x-_ |         | 7 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/flex-flow
   */
  "flex-flow"?: FlexFlow | undefined;
  /**
   * The **`font`** CSS shorthand property sets all the different properties of an element's font. Alternatively, it sets an element's font to a system font.
   * 
   * **Syntax**: `[ [ <'font-style'> || <font-variant-css21> || <'font-weight'> || <'font-stretch'> ]? <'font-size'> [ / <'line-height'> ]? <'font-family'> ] | caption | icon | menu | message-box | small-caption | status-bar`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/font
   */
  font?: Font | undefined;
  /**
   * The **`gap`** CSS property sets the gaps (gutters) between rows and columns. It is a shorthand for `row-gap` and `column-gap`.
   * 
   * **Syntax**: `<'row-gap'> <'column-gap'>?`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/gap
   */
  gap?: Gap<TLength> | undefined;
  /**
   * The **`grid`** CSS property is a shorthand property that sets all of the explicit and implicit grid properties in a single declaration.
   * 
   * **Syntax**: `<'grid-template'> | <'grid-template-rows'> / [ auto-flow && dense? ] <'grid-auto-columns'>? | [ auto-flow && dense? ] <'grid-auto-rows'>? / <'grid-template-columns'>`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid
   */
  grid?: Grid | undefined;
  /**
   * The **`grid-area`** CSS shorthand property specifies a grid item's size and location within a grid by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the edges of its grid area.
   * 
   * **Syntax**: `<grid-line> [ / <grid-line> ]{0,3}`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-area
   */
  "grid-area"?: GridArea | undefined;
  /**
   * The **`grid-column`** CSS shorthand property specifies a grid item's size and location within a grid column by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area.
   * 
   * **Syntax**: `<grid-line> [ / <grid-line> ]?`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-column
   */
  "grid-column"?: GridColumn | undefined;
  /**
   * The **`grid-row`** CSS shorthand property specifies a grid item's size and location within the grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area.
   * 
   * **Syntax**: `<grid-line> [ / <grid-line> ]?`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-row
   */
  "grid-row"?: GridRow | undefined;
  /**
   * The **`grid-template`** CSS property is a shorthand property for defining grid columns, rows, and areas.
   * 
   * **Syntax**: `none | [ <'grid-template-rows'> / <'grid-template-columns'> ] | [ <line-names>? <string> <track-size>? <line-names>? ]+ [ / <explicit-track-list> ]?`
   * 
   * | Chrome | Firefox |  Safari  |  Edge  | IE  |
   * | :----: | :-----: | :------: | :----: | :-: |
   * | **57** | **52**  | **10.1** | **16** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/grid-template
   */
  "grid-template"?: GridTemplate | undefined;
  /**
   * **Syntax**: `none | <integer>`
   * 
   * **Initial value**: `none`
   */
  "line-clamp"?: LineClamp | undefined;
  /**
   * The **`list-style`** CSS shorthand property allows you to set all the list style properties at once.
   * 
   * **Syntax**: `<'list-style-type'> || <'list-style-position'> || <'list-style-image'>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/list-style
   */
  "list-style"?: ListStyle | undefined;
  /**
   * The **`margin`** CSS shorthand property sets the margin area on all four sides of an element.
   * 
   * **Syntax**: `[ <length> | <percentage> | auto ]{1,4}`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/margin
   */
  margin?: Margin<TLength> | undefined;
  /**
   * The **`mask`** CSS shorthand property hides an element (partially or fully) by masking or clipping the image at specific points.
   * 
   * **Syntax**: `<mask-layer>#`
   * 
   * | Chrome | Firefox | Safari  | Edge  | IE  |
   * | :----: | :-----: | :-----: | :---: | :-: |
   * | **1**  |  **2**  | **3.1** | 12-79 | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask
   */
  mask?: Mask<TLength> | undefined;
  /**
   * The **`mask-border`** CSS shorthand property lets you create a mask along the edge of an element's border.
   * 
   * **Syntax**: `<'mask-border-source'> || <'mask-border-slice'> [ / <'mask-border-width'>? [ / <'mask-border-outset'> ]? ]? || <'mask-border-repeat'> || <'mask-border-mode'>`
   * 
   * |              Chrome              | Firefox |               Safari               | Edge | IE  |
   * | :------------------------------: | :-----: | :--------------------------------: | :--: | :-: |
   * | **1** _(-webkit-mask-box-image)_ |   No    | **3.1** _(-webkit-mask-box-image)_ | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/mask-border
   */
  "mask-border"?: MaskBorder | undefined;
  /**
   * The **`offset`** CSS shorthand property sets all the properties required for animating an element along a defined path.
   * 
   * **Syntax**: `[ <'offset-position'>? [ <'offset-path'> [ <'offset-distance'> || <'offset-rotate'> ]? ]? ]! [ / <'offset-anchor'> ]?`
   * 
   * |    Chrome     | Firefox | Safari | Edge | IE  |
   * | :-----------: | :-----: | :----: | :--: | :-: |
   * |    **55**     | **72**  | **16** | n/a  | No  |
   * | 46 _(motion)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset
   */
  motion?: Offset<TLength> | undefined;
  /**
   * The **`offset`** CSS shorthand property sets all the properties required for animating an element along a defined path.
   * 
   * **Syntax**: `[ <'offset-position'>? [ <'offset-path'> [ <'offset-distance'> || <'offset-rotate'> ]? ]? ]! [ / <'offset-anchor'> ]?`
   * 
   * |    Chrome     | Firefox | Safari | Edge | IE  |
   * | :-----------: | :-----: | :----: | :--: | :-: |
   * |    **55**     | **72**  | **16** | n/a  | No  |
   * | 46 _(motion)_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/offset
   */
  offset?: Offset<TLength> | undefined;
  /**
   * The **`outline`** CSS shorthand property set all the outline properties in a single declaration.
   * 
   * **Syntax**: `[ <'outline-color'> || <'outline-style'> || <'outline-width'> ]`
   * 
   * | Chrome | Firefox | Safari  |  Edge  |  IE   |
   * | :----: | :-----: | :-----: | :----: | :---: |
   * | **1**  | **1.5** | **1.2** | **12** | **8** |
   * @see https://developer.mozilla.org/docs/Web/CSS/outline
   */
  outline?: Outline<TLength> | undefined;
  /**
   * The **`overflow`** CSS shorthand property sets the desired behavior for an element's overflow — i.e. when an element's content is too big to fit in its block formatting context — in both directions.
   * 
   * **Syntax**: `[ visible | hidden | clip | scroll | auto ]{1,2}`
   * 
   * **Initial value**: `visible`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/overflow
   */
  overflow?: Overflow | undefined;
  /**
   * The **`overscroll-behavior`** CSS property sets what a browser does when reaching the boundary of a scrolling area. It's a shorthand for `overscroll-behavior-x` and `overscroll-behavior-y`.
   * 
   * **Syntax**: `[ contain | none | auto ]{1,2}`
   * 
   * **Initial value**: `auto`
   * 
   * | Chrome | Firefox | Safari |  Edge  | IE  |
   * | :----: | :-----: | :----: | :----: | :-: |
   * | **63** | **59**  | **16** | **18** | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior
   */
  "overscroll-behavior"?: OverscrollBehavior | undefined;
  /**
   * The **`padding`** CSS shorthand property sets the padding area on all four sides of an element at once.
   * 
   * **Syntax**: `[ <length> | <percentage> ]{1,4}`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **4** |
   * @see https://developer.mozilla.org/docs/Web/CSS/padding
   */
  padding?: Padding<TLength> | undefined;
  /**
   * The CSS **`place-items`** shorthand property allows you to align items along both the block and inline directions at once (i.e. the `align-items` and `justify-items` properties) in a relevant layout system such as Grid or Flexbox. If the second value is not set, the first value is also used for it.
   * 
   * **Syntax**: `<'align-items'> <'justify-items'>?`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **59** | **45**  | **11** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/place-items
   */
  "place-items"?: PlaceItems | undefined;
  /**
   * The **`place-self`** CSS shorthand property allows you to align an individual item in both the block and inline directions at once (i.e. the `align-self` and `justify-self` properties) in a relevant layout system such as Grid or Flexbox. If the second value is not present, the first value is also used for it.
   * 
   * **Syntax**: `<'align-self'> <'justify-self'>?`
   * 
   * | Chrome | Firefox | Safari | Edge | IE  |
   * | :----: | :-----: | :----: | :--: | :-: |
   * | **59** | **45**  | **11** | n/a  | No  |
   * @see https://developer.mozilla.org/docs/Web/CSS/place-self
   */
  "place-self"?: PlaceSelf | undefined;
  /**
   * The **`text-decoration`** shorthand CSS property sets the appearance of decorative lines on text. It is a shorthand for `text-decoration-line`, `text-decoration-color`, `text-decoration-style`, and the newer `text-decoration-thickness` property.
   * 
   * **Syntax**: `<'text-decoration-line'> || <'text-decoration-style'> || <'text-decoration-color'> || <'text-decoration-thickness'>`
   * 
   * | Chrome | Firefox | Safari |  Edge  |  IE   |
   * | :----: | :-----: | :----: | :----: | :---: |
   * | **1**  |  **1**  | **1**  | **12** | **3** |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration
   */
  "text-decoration"?: TextDecoration<TLength> | undefined;
  /**
   * The **`text-emphasis`** CSS property applies emphasis marks to text (except spaces and control characters). It is a shorthand for `text-emphasis-style` and `text-emphasis-color`.
   * 
   * **Syntax**: `<'text-emphasis-style'> || <'text-emphasis-color'>`
   * 
   * |  Chrome  | Firefox | Safari | Edge | IE  |
   * | :------: | :-----: | :----: | :--: | :-: |
   * |  **99**  | **46**  | **7**  | n/a  | No  |
   * | 25 _-x-_ |         |        |      |     |
   * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis
   */
  "text-emphasis"?: TextEmphasis | undefined;
  /**
   * The **`transition`** CSS property is a shorthand property for `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.
   * 
   * **Syntax**: `<single-transition>#`
   * 
   * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
   * | :-----: | :-----: | :-------: | :----: | :----: |
   * | **26**  | **16**  |   **9**   | **12** | **10** |
   * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
   * @see https://developer.mozilla.org/docs/Web/CSS/transition
   */
  transition?: Transition<TTime> | undefined;
}

export interface VendorLonghandPropertiesHyphen<TLength = (string & {}) | 0, TTime = string & {}> {
  /**
   * The **`animation-delay`** CSS property specifies the amount of time to wait from applying the animation to an element before beginning to perform the animation. The animation can start later, immediately from its beginning, or immediately and partway through the animation.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  "-moz-animation-delay"?: AnimationDelay<TTime> | undefined;
  /**
   * The **`animation-direction`** CSS property sets whether an animation should play forward, backward, or alternate back and forth between playing the sequence forward and backward.
   * 
   * **Syntax**: `<single-animation-direction>#`
   * 
   * **Initial value**: `normal`
   */
  "-moz-animation-direction"?: AnimationDirection | undefined;
  /**
   * The **`animation-duration`** CSS property sets the length of time that an animation takes to complete one cycle.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  "-moz-animation-duration"?: AnimationDuration<TTime> | undefined;
  /**
   * The **`animation-fill-mode`** CSS property sets how a CSS animation applies styles to its target before and after its execution.
   * 
   * **Syntax**: `<single-animation-fill-mode>#`
   * 
   * **Initial value**: `none`
   */
  "-moz-animation-fill-mode"?: AnimationFillMode | undefined;
  /**
   * The **`animation-iteration-count`** CSS property sets the number of times an animation sequence should be played before stopping.
   * 
   * **Syntax**: `<single-animation-iteration-count>#`
   * 
   * **Initial value**: `1`
   */
  "-moz-animation-iteration-count"?: AnimationIterationCount | undefined;
  /**
   * The **`animation-name`** CSS property specifies the names of one or more `@keyframes` at-rules describing the animation or animations to apply to the element.
   * 
   * **Syntax**: `[ none | <keyframes-name> ]#`
   * 
   * **Initial value**: `none`
   */
  "-moz-animation-name"?: AnimationName | undefined;
  /**
   * The **`animation-play-state`** CSS property sets whether an animation is running or paused.
   * 
   * **Syntax**: `<single-animation-play-state>#`
   * 
   * **Initial value**: `running`
   */
  "-moz-animation-play-state"?: AnimationPlayState | undefined;
  /**
   * The **`animation-timing-function`** CSS property sets how an animation progresses through the duration of each cycle.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   */
  "-moz-animation-timing-function"?: AnimationTimingFunction | undefined;
  /**
   * The **`appearance`** CSS property is used to display an element using platform-native styling, based on the operating system's theme. The **`-moz-appearance`** and **`-webkit-appearance`** properties are non-standard versions of this property, used (respectively) by Gecko (Firefox) and by WebKit-based (e.g., Safari) and Blink-based (e.g., Chrome, Opera) browsers to achieve the same thing. Note that Firefox and Edge also support **`-webkit-appearance`**, for compatibility reasons.
   * 
   * **Syntax**: `none | button | button-arrow-down | button-arrow-next | button-arrow-previous | button-arrow-up | button-bevel | button-focus | caret | checkbox | checkbox-container | checkbox-label | checkmenuitem | dualbutton | groupbox | listbox | listitem | menuarrow | menubar | menucheckbox | menuimage | menuitem | menuitemtext | menulist | menulist-button | menulist-text | menulist-textfield | menupopup | menuradio | menuseparator | meterbar | meterchunk | progressbar | progressbar-vertical | progresschunk | progresschunk-vertical | radio | radio-container | radio-label | radiomenuitem | range | range-thumb | resizer | resizerpanel | scale-horizontal | scalethumbend | scalethumb-horizontal | scalethumbstart | scalethumbtick | scalethumb-vertical | scale-vertical | scrollbarbutton-down | scrollbarbutton-left | scrollbarbutton-right | scrollbarbutton-up | scrollbarthumb-horizontal | scrollbarthumb-vertical | scrollbartrack-horizontal | scrollbartrack-vertical | searchfield | separator | sheet | spinner | spinner-downbutton | spinner-textfield | spinner-upbutton | splitter | statusbar | statusbarpanel | tab | tabpanel | tabpanels | tab-scroll-arrow-back | tab-scroll-arrow-forward | textfield | textfield-multiline | toolbar | toolbarbutton | toolbarbutton-dropdown | toolbargripper | toolbox | tooltip | treeheader | treeheadercell | treeheadersortarrow | treeitem | treeline | treetwisty | treetwistyopen | treeview | -moz-mac-unified-toolbar | -moz-win-borderless-glass | -moz-win-browsertabbar-toolbox | -moz-win-communicationstext | -moz-win-communications-toolbox | -moz-win-exclude-glass | -moz-win-glass | -moz-win-mediatext | -moz-win-media-toolbox | -moz-window-button-box | -moz-window-button-box-maximized | -moz-window-button-close | -moz-window-button-maximize | -moz-window-button-minimize | -moz-window-button-restore | -moz-window-frame-bottom | -moz-window-frame-left | -moz-window-frame-right | -moz-window-titlebar | -moz-window-titlebar-maximized`
   * 
   * **Initial value**: `none` (but this value is overridden in the user agent CSS)
   */
  "-moz-appearance"?: MozAppearance | undefined;
  /**
   * The **`backface-visibility`** CSS property sets whether the back face of an element is visible when turned towards the user.
   * 
   * **Syntax**: `visible | hidden`
   * 
   * **Initial value**: `visible`
   */
  "-moz-backface-visibility"?: BackfaceVisibility | undefined;
  /**
   * In Mozilla applications like Firefox, the **`-moz-border-bottom-colors`** CSS property sets a list of colors for the bottom border.
   * 
   * **Syntax**: `<color>+ | none`
   * 
   * **Initial value**: `none`
   */
  "-moz-border-bottom-colors"?: MozBorderBottomColors | undefined;
  /**
   * The **`border-inline-end-color`** CSS property defines the color of the logical inline-end border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   */
  "-moz-border-end-color"?: BorderInlineEndColor | undefined;
  /**
   * The **`border-inline-end-style`** CSS property defines the style of the logical inline end border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   */
  "-moz-border-end-style"?: BorderInlineEndStyle | undefined;
  /**
   * The **`border-inline-end-width`** CSS property defines the width of the logical inline-end border of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width`, `border-right-width`, `border-bottom-width`, or `border-left-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-width'>`
   * 
   * **Initial value**: `medium`
   */
  "-moz-border-end-width"?: BorderInlineEndWidth<TLength> | undefined;
  /**
   * In Mozilla applications like Firefox, the **`-moz-border-left-colors`** CSS property sets a list of colors for the left border.
   * 
   * **Syntax**: `<color>+ | none`
   * 
   * **Initial value**: `none`
   */
  "-moz-border-left-colors"?: MozBorderLeftColors | undefined;
  /**
   * In Mozilla applications like Firefox, the **`-moz-border-right-colors`** CSS property sets a list of colors for the right border.
   * 
   * **Syntax**: `<color>+ | none`
   * 
   * **Initial value**: `none`
   */
  "-moz-border-right-colors"?: MozBorderRightColors | undefined;
  /**
   * The **`border-inline-start-color`** CSS property defines the color of the logical inline start border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-color'>`
   * 
   * **Initial value**: `currentcolor`
   */
  "-moz-border-start-color"?: BorderInlineStartColor | undefined;
  /**
   * The **`border-inline-start-style`** CSS property defines the style of the logical inline start border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'border-top-style'>`
   * 
   * **Initial value**: `none`
   */
  "-moz-border-start-style"?: BorderInlineStartStyle | undefined;
  /**
   * In Mozilla applications like Firefox, the **`-moz-border-top-colors`** CSS property sets a list of colors for the top border.
   * 
   * **Syntax**: `<color>+ | none`
   * 
   * **Initial value**: `none`
   */
  "-moz-border-top-colors"?: MozBorderTopColors | undefined;
  /**
   * The **`box-sizing`** CSS property sets how the total width and height of an element is calculated.
   * 
   * **Syntax**: `content-box | border-box`
   * 
   * **Initial value**: `content-box`
   */
  "-moz-box-sizing"?: BoxSizing | undefined;
  /**
   * The **`column-count`** CSS property breaks an element's content into the specified number of columns.
   * 
   * **Syntax**: `<integer> | auto`
   * 
   * **Initial value**: `auto`
   */
  "-moz-column-count"?: ColumnCount | undefined;
  /**
   * The **`column-fill`** CSS property controls how an element's contents are balanced when broken into columns.
   * 
   * **Syntax**: `auto | balance | balance-all`
   * 
   * **Initial value**: `balance`
   */
  "-moz-column-fill"?: ColumnFill | undefined;
  /**
   * The **`column-rule-color`** CSS property sets the color of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  "-moz-column-rule-color"?: ColumnRuleColor | undefined;
  /**
   * The **`column-rule-style`** CSS property sets the style of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'border-style'>`
   * 
   * **Initial value**: `none`
   */
  "-moz-column-rule-style"?: ColumnRuleStyle | undefined;
  /**
   * The **`column-rule-width`** CSS property sets the width of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'border-width'>`
   * 
   * **Initial value**: `medium`
   */
  "-moz-column-rule-width"?: ColumnRuleWidth<TLength> | undefined;
  /**
   * The **`column-width`** CSS property sets the ideal column width in a multi-column layout. The container will have as many columns as can fit without any of them having a width less than the `column-width` value. If the width of the container is narrower than the specified value, the single column's width will be smaller than the declared column width.
   * 
   * **Syntax**: `<length> | auto`
   * 
   * **Initial value**: `auto`
   */
  "-moz-column-width"?: ColumnWidth<TLength> | undefined;
  /**
   * The **`-moz-context-properties`** property can be used within privileged contexts in Firefox to share the values of specified properties of the element with a child SVG image.
   * 
   * **Syntax**: `none | [ fill | fill-opacity | stroke | stroke-opacity ]#`
   * 
   * **Initial value**: `none`
   */
  "-moz-context-properties"?: MozContextProperties | undefined;
  /**
   * The **`font-feature-settings`** CSS property controls advanced typographic features in OpenType fonts.
   * 
   * **Syntax**: `normal | <feature-tag-value>#`
   * 
   * **Initial value**: `normal`
   */
  "-moz-font-feature-settings"?: FontFeatureSettings | undefined;
  /**
   * The **`font-language-override`** CSS property controls the use of language-specific glyphs in a typeface.
   * 
   * **Syntax**: `normal | <string>`
   * 
   * **Initial value**: `normal`
   */
  "-moz-font-language-override"?: FontLanguageOverride | undefined;
  /**
   * The **`hyphens`** CSS property specifies how words should be hyphenated when text wraps across multiple lines. It can prevent hyphenation entirely, hyphenate at manually-specified points within the text, or let the browser automatically insert hyphens where appropriate.
   * 
   * **Syntax**: `none | manual | auto`
   * 
   * **Initial value**: `manual`
   */
  "-moz-hyphens"?: Hyphens | undefined;
  /**
   * For certain XUL elements and pseudo-elements that use an image from the `list-style-image` property, this property specifies a region of the image that is used in place of the whole image. This allows elements to use different pieces of the same image to improve performance.
   * 
   * **Syntax**: `<shape> | auto`
   * 
   * **Initial value**: `auto`
   */
  "-moz-image-region"?: MozImageRegion | undefined;
  /**
   * The **`margin-inline-end`** CSS property defines the logical inline end margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation. In other words, it corresponds to the `margin-top`, `margin-right`, `margin-bottom` or `margin-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   */
  "-moz-margin-end"?: MarginInlineEnd<TLength> | undefined;
  /**
   * The **`margin-inline-start`** CSS property defines the logical inline start margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation. It corresponds to the `margin-top`, `margin-right`, `margin-bottom`, or `margin-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   */
  "-moz-margin-start"?: MarginInlineStart<TLength> | undefined;
  /**
   * The **`-moz-orient`** CSS property specifies the orientation of the element to which it's applied.
   * 
   * **Syntax**: `inline | block | horizontal | vertical`
   * 
   * **Initial value**: `inline`
   */
  "-moz-orient"?: MozOrient | undefined;
  /**
   * The **`font-smooth`** CSS property controls the application of anti-aliasing when fonts are rendered.
   * 
   * **Syntax**: `auto | never | always | <absolute-size> | <length>`
   * 
   * **Initial value**: `auto`
   */
  "-moz-osx-font-smoothing"?: FontSmooth<TLength> | undefined;
  /**
   * The **`padding-inline-end`** CSS property defines the logical inline end padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   */
  "-moz-padding-end"?: PaddingInlineEnd<TLength> | undefined;
  /**
   * The **`padding-inline-start`** CSS property defines the logical inline start padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   */
  "-moz-padding-start"?: PaddingInlineStart<TLength> | undefined;
  /**
   * The **`perspective`** CSS property determines the distance between the z=0 plane and the user in order to give a 3D-positioned element some perspective.
   * 
   * **Syntax**: `none | <length>`
   * 
   * **Initial value**: `none`
   */
  "-moz-perspective"?: Perspective<TLength> | undefined;
  /**
   * The **`perspective-origin`** CSS property determines the position at which the viewer is looking. It is used as the _vanishing point_ by the `perspective` property.
   * 
   * **Syntax**: `<position>`
   * 
   * **Initial value**: `50% 50%`
   */
  "-moz-perspective-origin"?: PerspectiveOrigin<TLength> | undefined;
  /**
   * **`-moz-stack-sizing`** is an extended CSS property. Normally, a `<xul:stack>` will change its size so that all of its child elements are completely visible. For example, moving a child of the stack far to the right will widen the stack so the child remains visible.
   * 
   * **Syntax**: `ignore | stretch-to-fit`
   * 
   * **Initial value**: `stretch-to-fit`
   */
  "-moz-stack-sizing"?: MozStackSizing | undefined;
  /**
   * The **`tab-size`** CSS property is used to customize the width of tab characters (U+0009).
   * 
   * **Syntax**: `<integer> | <length>`
   * 
   * **Initial value**: `8`
   */
  "-moz-tab-size"?: TabSize<TLength> | undefined;
  /**
   * The **`-moz-text-blink`** non-standard Mozilla CSS extension specifies the blink mode.
   * 
   * **Syntax**: `none | blink`
   * 
   * **Initial value**: `none`
   */
  "-moz-text-blink"?: MozTextBlink | undefined;
  /**
   * The **`text-size-adjust`** CSS property controls the text inflation algorithm used on some smartphones and tablets. Other browsers will ignore this property.
   * 
   * **Syntax**: `none | auto | <percentage>`
   * 
   * **Initial value**: `auto` for smartphone browsers supporting inflation, `none` in other cases (and then not modifiable).
   */
  "-moz-text-size-adjust"?: TextSizeAdjust | undefined;
  /**
   * The **`transform-origin`** CSS property sets the origin for an element's transformations.
   * 
   * **Syntax**: `[ <length-percentage> | left | center | right | top | bottom ] | [ [ <length-percentage> | left | center | right ] && [ <length-percentage> | top | center | bottom ] ] <length>?`
   * 
   * **Initial value**: `50% 50% 0`
   */
  "-moz-transform-origin"?: TransformOrigin<TLength> | undefined;
  /**
   * The **`transform-style`** CSS property sets whether children of an element are positioned in the 3D space or are flattened in the plane of the element.
   * 
   * **Syntax**: `flat | preserve-3d`
   * 
   * **Initial value**: `flat`
   */
  "-moz-transform-style"?: TransformStyle | undefined;
  /**
   * The **`transition-delay`** CSS property specifies the duration to wait before starting a property's transition effect when its value changes.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  "-moz-transition-delay"?: TransitionDelay<TTime> | undefined;
  /**
   * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  "-moz-transition-duration"?: TransitionDuration<TTime> | undefined;
  /**
   * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
   * 
   * **Syntax**: `none | <single-transition-property>#`
   * 
   * **Initial value**: all
   */
  "-moz-transition-property"?: TransitionProperty | undefined;
  /**
   * The **`transition-timing-function`** CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   */
  "-moz-transition-timing-function"?: TransitionTimingFunction | undefined;
  /**
   * The **`-moz-user-focus`** CSS property is used to indicate whether an element can have the focus.
   * 
   * **Syntax**: `ignore | normal | select-after | select-before | select-menu | select-same | select-all | none`
   * 
   * **Initial value**: `none`
   */
  "-moz-user-focus"?: MozUserFocus | undefined;
  /**
   * The **`user-modify`** property has no effect in Firefox. It was originally planned to determine whether or not the content of an element can be edited by a user.
   * 
   * **Syntax**: `read-only | read-write | write-only`
   * 
   * **Initial value**: `read-only`
   */
  "-moz-user-modify"?: MozUserModify | undefined;
  /**
   * The **`user-select`** CSS property controls whether the user can select text. This doesn't have any effect on content loaded as part of a browser's user interface (its chrome), except in textboxes.
   * 
   * **Syntax**: `auto | text | none | contain | all`
   * 
   * **Initial value**: `auto`
   */
  "-moz-user-select"?: UserSelect | undefined;
  /**
   * The **`-moz-window-dragging`** CSS property specifies whether a window is draggable or not. It only works in Chrome code, and only on Mac OS X.
   * 
   * **Syntax**: `drag | no-drag`
   * 
   * **Initial value**: `drag`
   */
  "-moz-window-dragging"?: MozWindowDragging | undefined;
  /**
   * The **`-moz-window-shadow`** CSS property specifies whether a window will have a shadow. It only works on Mac OS X.
   * 
   * **Syntax**: `default | menu | tooltip | sheet | none`
   * 
   * **Initial value**: `default`
   */
  "-moz-window-shadow"?: MozWindowShadow | undefined;
  /**
   * The **`-ms-accelerator`** CSS property is a Microsoft extension that sets or retrieves a string indicating whether the object represents a keyboard shortcut.
   * 
   * **Syntax**: `false | true`
   * 
   * **Initial value**: `false`
   */
  "-ms-accelerator"?: MsAccelerator | undefined;
  /**
   * The **`-ms-block-progression`** CSS property is a Microsoft extension that specifies the block progression and layout orientation.
   * 
   * **Syntax**: `tb | rl | bt | lr`
   * 
   * **Initial value**: `tb`
   */
  "-ms-block-progression"?: MsBlockProgression | undefined;
  /**
   * The **`-ms-content-zoom-chaining`** CSS property is a Microsoft extension specifying the zoom behavior that occurs when a user hits the zoom limit during page manipulation.
   * 
   * **Syntax**: `none | chained`
   * 
   * **Initial value**: `none`
   */
  "-ms-content-zoom-chaining"?: MsContentZoomChaining | undefined;
  /**
   * The **`-ms-content-zoom-limit-max`** CSS property is a Microsoft extension that specifies the selected elements' maximum zoom factor.
   * 
   * **Syntax**: `<percentage>`
   * 
   * **Initial value**: `400%`
   */
  "-ms-content-zoom-limit-max"?: MsContentZoomLimitMax | undefined;
  /**
   * The **`-ms-content-zoom-limit-min`** CSS property is a Microsoft extension that specifies the minimum zoom factor.
   * 
   * **Syntax**: `<percentage>`
   * 
   * **Initial value**: `100%`
   */
  "-ms-content-zoom-limit-min"?: MsContentZoomLimitMin | undefined;
  /**
   * The **`-ms-content-zoom-snap-points`** CSS property is a Microsoft extension that specifies where zoom snap-points are located.
   * 
   * **Syntax**: `snapInterval( <percentage>, <percentage> ) | snapList( <percentage># )`
   * 
   * **Initial value**: `snapInterval(0%, 100%)`
   */
  "-ms-content-zoom-snap-points"?: MsContentZoomSnapPoints | undefined;
  /**
   * The **`-ms-content-zoom-snap-type`** CSS property is a Microsoft extension that specifies how zooming is affected by defined snap-points.
   * 
   * **Syntax**: `none | proximity | mandatory`
   * 
   * **Initial value**: `none`
   */
  "-ms-content-zoom-snap-type"?: MsContentZoomSnapType | undefined;
  /**
   * The **`-ms-content-zooming`** CSS property is a Microsoft extension that specifies whether zooming is enabled.
   * 
   * **Syntax**: `none | zoom`
   * 
   * **Initial value**: zoom for the top level element, none for all other elements
   */
  "-ms-content-zooming"?: MsContentZooming | undefined;
  /**
   * The `-ms-filter` CSS property is a Microsoft extension that sets or retrieves the filter or collection of filters applied to an object.
   * 
   * **Syntax**: `<string>`
   * 
   * **Initial value**: "" (the empty string)
   */
  "-ms-filter"?: MsFilter | undefined;
  /**
   * The **`flex-direction`** CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).
   * 
   * **Syntax**: `row | row-reverse | column | column-reverse`
   * 
   * **Initial value**: `row`
   */
  "-ms-flex-direction"?: FlexDirection | undefined;
  /**
   * The **`flex-grow`** CSS property sets the flex grow factor of a flex item's main size.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   */
  "-ms-flex-positive"?: FlexGrow | undefined;
  /**
   * The **`-ms-flow-from`** CSS property is a Microsoft extension that gets or sets a value identifying a region container in the document that accepts the content flow from the data source.
   * 
   * **Syntax**: `[ none | <custom-ident> ]#`
   * 
   * **Initial value**: `none`
   */
  "-ms-flow-from"?: MsFlowFrom | undefined;
  /**
   * The **`-ms-flow-into`** CSS property is a Microsoft extension that gets or sets a value identifying an iframe container in the document that serves as the region's data source.
   * 
   * **Syntax**: `[ none | <custom-ident> ]#`
   * 
   * **Initial value**: `none`
   */
  "-ms-flow-into"?: MsFlowInto | undefined;
  /**
   * The **`grid-template-columns`** CSS property defines the line names and track sizing functions of the grid columns.
   * 
   * **Syntax**: `none | <track-list> | <auto-track-list>`
   * 
   * **Initial value**: `none`
   */
  "-ms-grid-columns"?: MsGridColumns<TLength> | undefined;
  /**
   * The **`grid-template-rows`** CSS property defines the line names and track sizing functions of the grid rows.
   * 
   * **Syntax**: `none | <track-list> | <auto-track-list>`
   * 
   * **Initial value**: `none`
   */
  "-ms-grid-rows"?: MsGridRows<TLength> | undefined;
  /**
   * The **`-ms-high-contrast-adjust`** CSS property is a Microsoft extension that gets or sets a value indicating whether to override any CSS properties that would have been set in high contrast mode.
   * 
   * **Syntax**: `auto | none`
   * 
   * **Initial value**: `auto`
   */
  "-ms-high-contrast-adjust"?: MsHighContrastAdjust | undefined;
  /**
   * The **`-ms-hyphenate-limit-chars`** CSS property is a Microsoft extension that specifies one to three values indicating the minimum number of characters in a hyphenated word. If the word does not meet the required minimum number of characters in the word, before the hyphen, or after the hyphen, then the word is not hyphenated.
   * 
   * **Syntax**: `auto | <integer>{1,3}`
   * 
   * **Initial value**: `auto`
   */
  "-ms-hyphenate-limit-chars"?: MsHyphenateLimitChars | undefined;
  /**
   * The **`-ms-hyphenate-limit-lines`** CSS property is a Microsoft extension specifying the maximum number of consecutive lines in an element that may be ended with a hyphenated word.
   * 
   * **Syntax**: `no-limit | <integer>`
   * 
   * **Initial value**: `no-limit`
   */
  "-ms-hyphenate-limit-lines"?: MsHyphenateLimitLines | undefined;
  /**
   * The `**-ms-hyphenate-limit-zone**` CSS property is a Microsoft extension specifying the width of the hyphenation zone.
   * 
   * **Syntax**: `<percentage> | <length>`
   * 
   * **Initial value**: `0`
   */
  "-ms-hyphenate-limit-zone"?: MsHyphenateLimitZone<TLength> | undefined;
  /**
   * The **`hyphens`** CSS property specifies how words should be hyphenated when text wraps across multiple lines. It can prevent hyphenation entirely, hyphenate at manually-specified points within the text, or let the browser automatically insert hyphens where appropriate.
   * 
   * **Syntax**: `none | manual | auto`
   * 
   * **Initial value**: `manual`
   */
  "-ms-hyphens"?: Hyphens | undefined;
  /**
   * The **`-ms-ime-align`** CSS property is a Microsoft extension aligning the Input Method Editor (IME) candidate window box relative to the element on which the IME composition is active. The extension is implemented in Microsoft Edge and Internet Explorer 11.
   * 
   * **Syntax**: `auto | after`
   * 
   * **Initial value**: `auto`
   */
  "-ms-ime-align"?: MsImeAlign | undefined;
  /**
   * The **`line-break`** CSS property sets how to break lines of Chinese, Japanese, or Korean (CJK) text when working with punctuation and symbols.
   * 
   * **Syntax**: `auto | loose | normal | strict | anywhere`
   * 
   * **Initial value**: `auto`
   */
  "-ms-line-break"?: LineBreak | undefined;
  /**
   * The **`order`** CSS property sets the order to lay out an item in a flex or grid container. Items in a container are sorted by ascending `order` value and then by their source code order.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `0`
   */
  "-ms-order"?: Order | undefined;
  /**
   * The **`-ms-overflow-style`** CSS property is a Microsoft extension controlling the behavior of scrollbars when the content of an element overflows.
   * 
   * **Syntax**: `auto | none | scrollbar | -ms-autohiding-scrollbar`
   * 
   * **Initial value**: `auto`
   */
  "-ms-overflow-style"?: MsOverflowStyle | undefined;
  /**
   * The **`overflow-x`** CSS property sets what shows when content overflows a block-level element's left and right edges. This may be nothing, a scroll bar, or the overflow content.
   * 
   * **Syntax**: `visible | hidden | clip | scroll | auto`
   * 
   * **Initial value**: `visible`
   */
  "-ms-overflow-x"?: OverflowX | undefined;
  /**
   * The **`overflow-y`** CSS property sets what shows when content overflows a block-level element's top and bottom edges. This may be nothing, a scroll bar, or the overflow content.
   * 
   * **Syntax**: `visible | hidden | clip | scroll | auto`
   * 
   * **Initial value**: `visible`
   */
  "-ms-overflow-y"?: OverflowY | undefined;
  /**
   * The `**-ms-scroll-chaining**` CSS property is a Microsoft extension that specifies the scrolling behavior that occurs when a user hits the scroll limit during a manipulation.
   * 
   * **Syntax**: `chained | none`
   * 
   * **Initial value**: `chained`
   */
  "-ms-scroll-chaining"?: MsScrollChaining | undefined;
  /**
   * The `**-ms-scroll-limit-x-max**` CSS property is a Microsoft extension that specifies the maximum value for the `Element.scrollLeft` property.
   * 
   * **Syntax**: `auto | <length>`
   * 
   * **Initial value**: `auto`
   */
  "-ms-scroll-limit-x-max"?: MsScrollLimitXMax<TLength> | undefined;
  /**
   * The **`-ms-scroll-limit-x-min`** CSS property is a Microsoft extension that specifies the minimum value for the `Element.scrollLeft` property.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   */
  "-ms-scroll-limit-x-min"?: MsScrollLimitXMin<TLength> | undefined;
  /**
   * The **`-ms-scroll-limit-y-max`** CSS property is a Microsoft extension that specifies the maximum value for the `Element.scrollTop` property.
   * 
   * **Syntax**: `auto | <length>`
   * 
   * **Initial value**: `auto`
   */
  "-ms-scroll-limit-y-max"?: MsScrollLimitYMax<TLength> | undefined;
  /**
   * The **`-ms-scroll-limit-y-min`** CSS property is a Microsoft extension that specifies the minimum value for the `Element.scrollTop` property.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   */
  "-ms-scroll-limit-y-min"?: MsScrollLimitYMin<TLength> | undefined;
  /**
   * The **`-ms-scroll-rails`** CSS property is a Microsoft extension that specifies whether scrolling locks to the primary axis of motion.
   * 
   * **Syntax**: `none | railed`
   * 
   * **Initial value**: `railed`
   */
  "-ms-scroll-rails"?: MsScrollRails | undefined;
  /**
   * The **`-ms-scroll-snap-points-x`** CSS property is a Microsoft extension that specifies where snap-points will be located along the x-axis.
   * 
   * **Syntax**: `snapInterval( <length-percentage>, <length-percentage> ) | snapList( <length-percentage># )`
   * 
   * **Initial value**: `snapInterval(0px, 100%)`
   */
  "-ms-scroll-snap-points-x"?: MsScrollSnapPointsX | undefined;
  /**
   * The **`-ms-scroll-snap-points-y`** CSS property is a Microsoft extension that specifies where snap-points will be located along the y-axis.
   * 
   * **Syntax**: `snapInterval( <length-percentage>, <length-percentage> ) | snapList( <length-percentage># )`
   * 
   * **Initial value**: `snapInterval(0px, 100%)`
   */
  "-ms-scroll-snap-points-y"?: MsScrollSnapPointsY | undefined;
  /**
   * The **`scroll-snap-type`** CSS property sets how strictly snap points are enforced on the scroll container in case there is one.
   * 
   * **Syntax**: `none | proximity | mandatory`
   * 
   * **Initial value**: `none`
   */
  "-ms-scroll-snap-type"?: MsScrollSnapType | undefined;
  /**
   * The **`-ms-scroll-translation`** CSS property is a Microsoft extension that specifies whether vertical-to-horizontal scroll wheel translation occurs on the specified element.
   * 
   * **Syntax**: `none | vertical-to-horizontal`
   * 
   * **Initial value**: `none`
   */
  "-ms-scroll-translation"?: MsScrollTranslation | undefined;
  /**
   * The **`-ms-scrollbar-3dlight-color`** CSS property is a Microsoft extension specifying the color of the top and left edges of the scroll box and scroll arrows of a scroll bar.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: depends on user agent
   */
  "-ms-scrollbar-3dlight-color"?: MsScrollbar3dlightColor | undefined;
  /**
   * The **`-ms-scrollbar-arrow-color`** CSS property is a Microsoft extension that specifies the color of the arrow elements of a scroll arrow.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `ButtonText`
   */
  "-ms-scrollbar-arrow-color"?: MsScrollbarArrowColor | undefined;
  /**
   * The `**-ms-scrollbar-base-color**` CSS property is a Microsoft extension that specifies the base color of the main elements of a scroll bar.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: depends on user agent
   */
  "-ms-scrollbar-base-color"?: MsScrollbarBaseColor | undefined;
  /**
   * The **`-ms-scrollbar-darkshadow-color`** CSS property is a Microsoft extension that specifies the color of a scroll bar's gutter.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `ThreeDDarkShadow`
   */
  "-ms-scrollbar-darkshadow-color"?: MsScrollbarDarkshadowColor | undefined;
  /**
   * The `**-ms-scrollbar-face-color**` CSS property is a Microsoft extension that specifies the color of the scroll box and scroll arrows of a scroll bar.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `ThreeDFace`
   */
  "-ms-scrollbar-face-color"?: MsScrollbarFaceColor | undefined;
  /**
   * The `**-ms-scrollbar-highlight-color**` CSS property is a Microsoft extension that specifies the color of the slider tray, the top and left edges of the scroll box, and the scroll arrows of a scroll bar.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `ThreeDHighlight`
   */
  "-ms-scrollbar-highlight-color"?: MsScrollbarHighlightColor | undefined;
  /**
   * The **`-ms-scrollbar-shadow-color`** CSS property is a Microsoft extension that specifies the color of the bottom and right edges of the scroll box and scroll arrows of a scroll bar.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `ThreeDDarkShadow`
   */
  "-ms-scrollbar-shadow-color"?: MsScrollbarShadowColor | undefined;
  /**
   * The **`-ms-scrollbar-track-color`** CSS property is a Microsoft extension that specifies the color of the track element of a scrollbar.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `Scrollbar`
   */
  "-ms-scrollbar-track-color"?: MsScrollbarTrackColor | undefined;
  /**
   * The **`-ms-text-autospace`** CSS property is a Microsoft extension that specifies the autospacing and narrow space width adjustment of text.
   * 
   * **Syntax**: `none | ideograph-alpha | ideograph-numeric | ideograph-parenthesis | ideograph-space`
   * 
   * **Initial value**: `none`
   */
  "-ms-text-autospace"?: MsTextAutospace | undefined;
  /**
   * The **`text-combine-upright`** CSS property sets the combination of characters into the space of a single character. If the combined text is wider than 1em, the user agent must fit the contents within 1em. The resulting composition is treated as a single upright glyph for layout and decoration. This property only has an effect in vertical writing modes.
   * 
   * **Syntax**: `none | all | [ digits <integer>? ]`
   * 
   * **Initial value**: `none`
   */
  "-ms-text-combine-horizontal"?: TextCombineUpright | undefined;
  /**
   * The **`text-overflow`** CSS property sets how hidden overflow content is signaled to users. It can be clipped, display an ellipsis ('`…`'), or display a custom string.
   * 
   * **Syntax**: `[ clip | ellipsis | <string> ]{1,2}`
   * 
   * **Initial value**: `clip`
   */
  "-ms-text-overflow"?: TextOverflow | undefined;
  /**
   * The **`touch-action`** CSS property sets how an element's region can be manipulated by a touchscreen user (for example, by zooming features built into the browser).
   * 
   * **Syntax**: `auto | none | [ [ pan-x | pan-left | pan-right ] || [ pan-y | pan-up | pan-down ] || pinch-zoom ] | manipulation`
   * 
   * **Initial value**: `auto`
   */
  "-ms-touch-action"?: TouchAction | undefined;
  /**
   * The **`-ms-touch-select`** CSS property is a Microsoft extension that toggles the gripper visual elements that enable touch text selection.
   * 
   * **Syntax**: `grippers | none`
   * 
   * **Initial value**: `grippers`
   */
  "-ms-touch-select"?: MsTouchSelect | undefined;
  /**
   * The **`transform`** CSS property lets you rotate, scale, skew, or translate an element. It modifies the coordinate space of the CSS visual formatting model.
   * 
   * **Syntax**: `none | <transform-list>`
   * 
   * **Initial value**: `none`
   */
  "-ms-transform"?: Transform | undefined;
  /**
   * The **`transform-origin`** CSS property sets the origin for an element's transformations.
   * 
   * **Syntax**: `[ <length-percentage> | left | center | right | top | bottom ] | [ [ <length-percentage> | left | center | right ] && [ <length-percentage> | top | center | bottom ] ] <length>?`
   * 
   * **Initial value**: `50% 50% 0`
   */
  "-ms-transform-origin"?: TransformOrigin<TLength> | undefined;
  /**
   * The **`transition-delay`** CSS property specifies the duration to wait before starting a property's transition effect when its value changes.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  "-ms-transition-delay"?: TransitionDelay<TTime> | undefined;
  /**
   * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  "-ms-transition-duration"?: TransitionDuration<TTime> | undefined;
  /**
   * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
   * 
   * **Syntax**: `none | <single-transition-property>#`
   * 
   * **Initial value**: all
   */
  "-ms-transition-property"?: TransitionProperty | undefined;
  /**
   * The **`transition-timing-function`** CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   */
  "-ms-transition-timing-function"?: TransitionTimingFunction | undefined;
  /**
   * The `**user-select**` CSS property controls whether the user can select text. This doesn't have any effect on content loaded as chrome, except in textboxes.
   * 
   * **Syntax**: `none | element | text`
   * 
   * **Initial value**: `text`
   */
  "-ms-user-select"?: MsUserSelect | undefined;
  /**
   * The **`word-break`** CSS property sets whether line breaks appear wherever the text would otherwise overflow its content box.
   * 
   * **Syntax**: `normal | break-all | keep-all | break-word`
   * 
   * **Initial value**: `normal`
   */
  "-ms-word-break"?: WordBreak | undefined;
  /**
   * The **`-ms-wrap-flow`** CSS property is a Microsoft extension that specifies how exclusions impact inline content within block-level elements.
   * 
   * **Syntax**: `auto | both | start | end | maximum | clear`
   * 
   * **Initial value**: `auto`
   */
  "-ms-wrap-flow"?: MsWrapFlow | undefined;
  /**
   * The **`-ms-wrap-margin`** CSS property is a Microsoft extension that specifies a margin that offsets the inner wrap shape from other shapes.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   */
  "-ms-wrap-margin"?: MsWrapMargin<TLength> | undefined;
  /**
   * The **`-ms-wrap-through`** CSS property is a Microsoft extension that specifies how content should wrap around an exclusion element.
   * 
   * **Syntax**: `wrap | none`
   * 
   * **Initial value**: `wrap`
   */
  "-ms-wrap-through"?: MsWrapThrough | undefined;
  /**
   * The **`writing-mode`** CSS property sets whether lines of text are laid out horizontally or vertically, as well as the direction in which blocks progress. When set for an entire document, it should be set on the root element (`html` element for HTML documents).
   * 
   * **Syntax**: `horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr`
   * 
   * **Initial value**: `horizontal-tb`
   */
  "-ms-writing-mode"?: WritingMode | undefined;
  /**
   * The CSS **`align-content`** property sets the distribution of space between and around content items along a flexbox's cross-axis or a grid's block axis.
   * 
   * **Syntax**: `normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position>`
   * 
   * **Initial value**: `normal`
   */
  "-webkit-align-content"?: AlignContent | undefined;
  /**
   * The CSS **`align-items`** property sets the `align-self` value on all direct children as a group. In Flexbox, it controls the alignment of items on the Cross Axis. In Grid Layout, it controls the alignment of items on the Block Axis within their grid area.
   * 
   * **Syntax**: `normal | stretch | <baseline-position> | [ <overflow-position>? <self-position> ]`
   * 
   * **Initial value**: `normal`
   */
  "-webkit-align-items"?: AlignItems | undefined;
  /**
   * The **`align-self`** CSS property overrides a grid or flex item's `align-items` value. In Grid, it aligns the item inside the grid area. In Flexbox, it aligns the item on the cross axis.
   * 
   * **Syntax**: `auto | normal | stretch | <baseline-position> | <overflow-position>? <self-position>`
   * 
   * **Initial value**: `auto`
   */
  "-webkit-align-self"?: AlignSelf | undefined;
  /**
   * The **`animation-delay`** CSS property specifies the amount of time to wait from applying the animation to an element before beginning to perform the animation. The animation can start later, immediately from its beginning, or immediately and partway through the animation.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  "-webkit-animation-delay"?: AnimationDelay<TTime> | undefined;
  /**
   * The **`animation-direction`** CSS property sets whether an animation should play forward, backward, or alternate back and forth between playing the sequence forward and backward.
   * 
   * **Syntax**: `<single-animation-direction>#`
   * 
   * **Initial value**: `normal`
   */
  "-webkit-animation-direction"?: AnimationDirection | undefined;
  /**
   * The **`animation-duration`** CSS property sets the length of time that an animation takes to complete one cycle.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  "-webkit-animation-duration"?: AnimationDuration<TTime> | undefined;
  /**
   * The **`animation-fill-mode`** CSS property sets how a CSS animation applies styles to its target before and after its execution.
   * 
   * **Syntax**: `<single-animation-fill-mode>#`
   * 
   * **Initial value**: `none`
   */
  "-webkit-animation-fill-mode"?: AnimationFillMode | undefined;
  /**
   * The **`animation-iteration-count`** CSS property sets the number of times an animation sequence should be played before stopping.
   * 
   * **Syntax**: `<single-animation-iteration-count>#`
   * 
   * **Initial value**: `1`
   */
  "-webkit-animation-iteration-count"?: AnimationIterationCount | undefined;
  /**
   * The **`animation-name`** CSS property specifies the names of one or more `@keyframes` at-rules describing the animation or animations to apply to the element.
   * 
   * **Syntax**: `[ none | <keyframes-name> ]#`
   * 
   * **Initial value**: `none`
   */
  "-webkit-animation-name"?: AnimationName | undefined;
  /**
   * The **`animation-play-state`** CSS property sets whether an animation is running or paused.
   * 
   * **Syntax**: `<single-animation-play-state>#`
   * 
   * **Initial value**: `running`
   */
  "-webkit-animation-play-state"?: AnimationPlayState | undefined;
  /**
   * The **`animation-timing-function`** CSS property sets how an animation progresses through the duration of each cycle.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   */
  "-webkit-animation-timing-function"?: AnimationTimingFunction | undefined;
  /**
   * The **`appearance`** CSS property is used to display an element using platform-native styling, based on the operating system's theme. The **`-moz-appearance`** and **`-webkit-appearance`** properties are non-standard versions of this property, used (respectively) by Gecko (Firefox) and by WebKit-based (e.g., Safari) and Blink-based (e.g., Chrome, Opera) browsers to achieve the same thing. Note that Firefox and Edge also support **`-webkit-appearance`**, for compatibility reasons.
   * 
   * **Syntax**: `none | button | button-bevel | caret | checkbox | default-button | inner-spin-button | listbox | listitem | media-controls-background | media-controls-fullscreen-background | media-current-time-display | media-enter-fullscreen-button | media-exit-fullscreen-button | media-fullscreen-button | media-mute-button | media-overlay-play-button | media-play-button | media-seek-back-button | media-seek-forward-button | media-slider | media-sliderthumb | media-time-remaining-display | media-toggle-closed-captions-button | media-volume-slider | media-volume-slider-container | media-volume-sliderthumb | menulist | menulist-button | menulist-text | menulist-textfield | meter | progress-bar | progress-bar-value | push-button | radio | searchfield | searchfield-cancel-button | searchfield-decoration | searchfield-results-button | searchfield-results-decoration | slider-horizontal | slider-vertical | sliderthumb-horizontal | sliderthumb-vertical | square-button | textarea | textfield | -apple-pay-button`
   * 
   * **Initial value**: `none` (but this value is overridden in the user agent CSS)
   */
  "-webkit-appearance"?: WebkitAppearance | undefined;
  /**
   * The **`backdrop-filter`** CSS property lets you apply graphical effects such as blurring or color shifting to the area behind an element. Because it applies to everything _behind_ the element, to see the effect you must make the element or its background at least partially transparent.
   * 
   * **Syntax**: `none | <filter-function-list>`
   * 
   * **Initial value**: `none`
   */
  "-webkit-backdrop-filter"?: BackdropFilter | undefined;
  /**
   * The **`backface-visibility`** CSS property sets whether the back face of an element is visible when turned towards the user.
   * 
   * **Syntax**: `visible | hidden`
   * 
   * **Initial value**: `visible`
   */
  "-webkit-backface-visibility"?: BackfaceVisibility | undefined;
  /**
   * The **`background-clip`** CSS property sets whether an element's background extends underneath its border box, padding box, or content box.
   * 
   * **Syntax**: `<box>#`
   * 
   * **Initial value**: `border-box`
   */
  "-webkit-background-clip"?: BackgroundClip | undefined;
  /**
   * The **`background-origin`** CSS property sets the background's origin: from the border start, inside the border, or inside the padding.
   * 
   * **Syntax**: `<box>#`
   * 
   * **Initial value**: `padding-box`
   */
  "-webkit-background-origin"?: BackgroundOrigin | undefined;
  /**
   * The **`background-size`** CSS property sets the size of the element's background image. The image can be left to its natural size, stretched, or constrained to fit the available space.
   * 
   * **Syntax**: `<bg-size>#`
   * 
   * **Initial value**: `auto auto`
   */
  "-webkit-background-size"?: BackgroundSize<TLength> | undefined;
  /**
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  "-webkit-border-before-color"?: WebkitBorderBeforeColor | undefined;
  /**
   * **Syntax**: `<'border-style'>`
   * 
   * **Initial value**: `none`
   */
  "-webkit-border-before-style"?: WebkitBorderBeforeStyle | undefined;
  /**
   * **Syntax**: `<'border-width'>`
   * 
   * **Initial value**: `medium`
   */
  "-webkit-border-before-width"?: WebkitBorderBeforeWidth<TLength> | undefined;
  /**
   * The **`border-bottom-left-radius`** CSS property rounds the bottom-left corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   */
  "-webkit-border-bottom-left-radius"?: BorderBottomLeftRadius<TLength> | undefined;
  /**
   * The **`border-bottom-right-radius`** CSS property rounds the bottom-right corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   */
  "-webkit-border-bottom-right-radius"?: BorderBottomRightRadius<TLength> | undefined;
  /**
   * The **`border-image-slice`** CSS property divides the image specified by `border-image-source` into regions. These regions form the components of an element's border image.
   * 
   * **Syntax**: `<number-percentage>{1,4} && fill?`
   * 
   * **Initial value**: `100%`
   */
  "-webkit-border-image-slice"?: BorderImageSlice | undefined;
  /**
   * The **`border-top-left-radius`** CSS property rounds the top-left corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   */
  "-webkit-border-top-left-radius"?: BorderTopLeftRadius<TLength> | undefined;
  /**
   * The **`border-top-right-radius`** CSS property rounds the top-right corner of an element by specifying the radius (or the radius of the semi-major and semi-minor axes) of the ellipse defining the curvature of the corner.
   * 
   * **Syntax**: `<length-percentage>{1,2}`
   * 
   * **Initial value**: `0`
   */
  "-webkit-border-top-right-radius"?: BorderTopRightRadius<TLength> | undefined;
  /**
   * The **`box-decoration-break`** CSS property specifies how an element's fragments should be rendered when broken across multiple lines, columns, or pages.
   * 
   * **Syntax**: `slice | clone`
   * 
   * **Initial value**: `slice`
   */
  "-webkit-box-decoration-break"?: BoxDecorationBreak | undefined;
  /**
   * The **`-webkit-box-reflect`** CSS property lets you reflect the content of an element in one specific direction.
   * 
   * **Syntax**: `[ above | below | right | left ]? <length>? <image>?`
   * 
   * **Initial value**: `none`
   */
  "-webkit-box-reflect"?: WebkitBoxReflect<TLength> | undefined;
  /**
   * The **`box-shadow`** CSS property adds shadow effects around an element's frame. You can set multiple effects separated by commas. A box shadow is described by X and Y offsets relative to the element, blur and spread radius, and color.
   * 
   * **Syntax**: `none | <shadow>#`
   * 
   * **Initial value**: `none`
   */
  "-webkit-box-shadow"?: BoxShadow | undefined;
  /**
   * The **`box-sizing`** CSS property sets how the total width and height of an element is calculated.
   * 
   * **Syntax**: `content-box | border-box`
   * 
   * **Initial value**: `content-box`
   */
  "-webkit-box-sizing"?: BoxSizing | undefined;
  /**
   * The **`clip-path`** CSS property creates a clipping region that sets what part of an element should be shown. Parts that are inside the region are shown, while those outside are hidden.
   * 
   * **Syntax**: `<clip-source> | [ <basic-shape> || <geometry-box> ] | none`
   * 
   * **Initial value**: `none`
   */
  "-webkit-clip-path"?: ClipPath | undefined;
  /**
   * The **`column-count`** CSS property breaks an element's content into the specified number of columns.
   * 
   * **Syntax**: `<integer> | auto`
   * 
   * **Initial value**: `auto`
   */
  "-webkit-column-count"?: ColumnCount | undefined;
  /**
   * The **`column-fill`** CSS property controls how an element's contents are balanced when broken into columns.
   * 
   * **Syntax**: `auto | balance | balance-all`
   * 
   * **Initial value**: `balance`
   */
  "-webkit-column-fill"?: ColumnFill | undefined;
  /**
   * The **`column-rule-color`** CSS property sets the color of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  "-webkit-column-rule-color"?: ColumnRuleColor | undefined;
  /**
   * The **`column-rule-style`** CSS property sets the style of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'border-style'>`
   * 
   * **Initial value**: `none`
   */
  "-webkit-column-rule-style"?: ColumnRuleStyle | undefined;
  /**
   * The **`column-rule-width`** CSS property sets the width of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'border-width'>`
   * 
   * **Initial value**: `medium`
   */
  "-webkit-column-rule-width"?: ColumnRuleWidth<TLength> | undefined;
  /**
   * The **`column-span`** CSS property makes it possible for an element to span across all columns when its value is set to `all`.
   * 
   * **Syntax**: `none | all`
   * 
   * **Initial value**: `none`
   */
  "-webkit-column-span"?: ColumnSpan | undefined;
  /**
   * The **`column-width`** CSS property sets the ideal column width in a multi-column layout. The container will have as many columns as can fit without any of them having a width less than the `column-width` value. If the width of the container is narrower than the specified value, the single column's width will be smaller than the declared column width.
   * 
   * **Syntax**: `<length> | auto`
   * 
   * **Initial value**: `auto`
   */
  "-webkit-column-width"?: ColumnWidth<TLength> | undefined;
  /**
   * The **`filter`** CSS property applies graphical effects like blur or color shift to an element. Filters are commonly used to adjust the rendering of images, backgrounds, and borders.
   * 
   * **Syntax**: `none | <filter-function-list>`
   * 
   * **Initial value**: `none`
   */
  "-webkit-filter"?: Filter | undefined;
  /**
   * The **`flex-basis`** CSS property sets the initial main size of a flex item. It sets the size of the content box unless otherwise set with `box-sizing`.
   * 
   * **Syntax**: `content | <'width'>`
   * 
   * **Initial value**: `auto`
   */
  "-webkit-flex-basis"?: FlexBasis<TLength> | undefined;
  /**
   * The **`flex-direction`** CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).
   * 
   * **Syntax**: `row | row-reverse | column | column-reverse`
   * 
   * **Initial value**: `row`
   */
  "-webkit-flex-direction"?: FlexDirection | undefined;
  /**
   * The **`flex-grow`** CSS property sets the flex grow factor of a flex item's main size.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `0`
   */
  "-webkit-flex-grow"?: FlexGrow | undefined;
  /**
   * The **`flex-shrink`** CSS property sets the flex shrink factor of a flex item. If the size of all flex items is larger than the flex container, items shrink to fit according to `flex-shrink`.
   * 
   * **Syntax**: `<number>`
   * 
   * **Initial value**: `1`
   */
  "-webkit-flex-shrink"?: FlexShrink | undefined;
  /**
   * The **`flex-wrap`** CSS property sets whether flex items are forced onto one line or can wrap onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked.
   * 
   * **Syntax**: `nowrap | wrap | wrap-reverse`
   * 
   * **Initial value**: `nowrap`
   */
  "-webkit-flex-wrap"?: FlexWrap | undefined;
  /**
   * The **`font-feature-settings`** CSS property controls advanced typographic features in OpenType fonts.
   * 
   * **Syntax**: `normal | <feature-tag-value>#`
   * 
   * **Initial value**: `normal`
   */
  "-webkit-font-feature-settings"?: FontFeatureSettings | undefined;
  /**
   * The **`font-kerning`** CSS property sets the use of the kerning information stored in a font.
   * 
   * **Syntax**: `auto | normal | none`
   * 
   * **Initial value**: `auto`
   */
  "-webkit-font-kerning"?: FontKerning | undefined;
  /**
   * The **`font-smooth`** CSS property controls the application of anti-aliasing when fonts are rendered.
   * 
   * **Syntax**: `auto | never | always | <absolute-size> | <length>`
   * 
   * **Initial value**: `auto`
   */
  "-webkit-font-smoothing"?: FontSmooth<TLength> | undefined;
  /**
   * The **`font-variant-ligatures`** CSS property controls which ligatures and contextual forms are used in textual content of the elements it applies to. This leads to more harmonized forms in the resulting text.
   * 
   * **Syntax**: `normal | none | [ <common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> ]`
   * 
   * **Initial value**: `normal`
   */
  "-webkit-font-variant-ligatures"?: FontVariantLigatures | undefined;
  /**
   * The **`hyphenate-character`** CSS property sets the character (or string) used at the end of a line before a hyphenation break.
   * 
   * **Syntax**: `auto | <string>`
   * 
   * **Initial value**: `auto`
   */
  "-webkit-hyphenate-character"?: HyphenateCharacter | undefined;
  /**
   * The **`hyphens`** CSS property specifies how words should be hyphenated when text wraps across multiple lines. It can prevent hyphenation entirely, hyphenate at manually-specified points within the text, or let the browser automatically insert hyphens where appropriate.
   * 
   * **Syntax**: `none | manual | auto`
   * 
   * **Initial value**: `manual`
   */
  "-webkit-hyphens"?: Hyphens | undefined;
  /**
   * The `initial-letter` CSS property sets styling for dropped, raised, and sunken initial letters.
   * 
   * **Syntax**: `normal | [ <number> <integer>? ]`
   * 
   * **Initial value**: `normal`
   */
  "-webkit-initial-letter"?: InitialLetter | undefined;
  /**
   * The CSS **`justify-content`** property defines how the browser distributes space between and around content items along the main-axis of a flex container, and the inline axis of a grid container.
   * 
   * **Syntax**: `normal | <content-distribution> | <overflow-position>? [ <content-position> | left | right ]`
   * 
   * **Initial value**: `normal`
   */
  "-webkit-justify-content"?: JustifyContent | undefined;
  /**
   * The **`line-break`** CSS property sets how to break lines of Chinese, Japanese, or Korean (CJK) text when working with punctuation and symbols.
   * 
   * **Syntax**: `auto | loose | normal | strict | anywhere`
   * 
   * **Initial value**: `auto`
   */
  "-webkit-line-break"?: LineBreak | undefined;
  /**
   * The **`-webkit-line-clamp`** CSS property allows limiting of the contents of a block container to the specified number of lines.
   * 
   * **Syntax**: `none | <integer>`
   * 
   * **Initial value**: `none`
   */
  "-webkit-line-clamp"?: WebkitLineClamp | undefined;
  /**
   * The **`margin-inline-end`** CSS property defines the logical inline end margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation. In other words, it corresponds to the `margin-top`, `margin-right`, `margin-bottom` or `margin-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   */
  "-webkit-margin-end"?: MarginInlineEnd<TLength> | undefined;
  /**
   * The **`margin-inline-start`** CSS property defines the logical inline start margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation. It corresponds to the `margin-top`, `margin-right`, `margin-bottom`, or `margin-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
   * 
   * **Syntax**: `<'margin-left'>`
   * 
   * **Initial value**: `0`
   */
  "-webkit-margin-start"?: MarginInlineStart<TLength> | undefined;
  /**
   * If a `-webkit-mask-image` is specified, `-webkit-mask-attachment` determines whether the mask image's position is fixed within the viewport, or scrolls along with its containing block.
   * 
   * **Syntax**: `<attachment>#`
   * 
   * **Initial value**: `scroll`
   */
  "-webkit-mask-attachment"?: WebkitMaskAttachment | undefined;
  /**
   * The **`mask-border-outset`** CSS property specifies the distance by which an element's mask border is set out from its border box.
   * 
   * **Syntax**: `[ <length> | <number> ]{1,4}`
   * 
   * **Initial value**: `0`
   */
  "-webkit-mask-box-image-outset"?: MaskBorderOutset<TLength> | undefined;
  /**
   * The **`mask-border-repeat`** CSS property sets how the edge regions of a source image are adjusted to fit the dimensions of an element's mask border.
   * 
   * **Syntax**: `[ stretch | repeat | round | space ]{1,2}`
   * 
   * **Initial value**: `stretch`
   */
  "-webkit-mask-box-image-repeat"?: MaskBorderRepeat | undefined;
  /**
   * The **`mask-border-slice`** CSS property divides the image set by `mask-border-source` into regions. These regions are used to form the components of an element's mask border.
   * 
   * **Syntax**: `<number-percentage>{1,4} fill?`
   * 
   * **Initial value**: `0`
   */
  "-webkit-mask-box-image-slice"?: MaskBorderSlice | undefined;
  /**
   * The **`mask-border-source`** CSS property sets the source image used to create an element's mask border.
   * 
   * **Syntax**: `none | <image>`
   * 
   * **Initial value**: `none`
   */
  "-webkit-mask-box-image-source"?: MaskBorderSource | undefined;
  /**
   * The **`mask-border-width`** CSS property sets the width of an element's mask border.
   * 
   * **Syntax**: `[ <length-percentage> | <number> | auto ]{1,4}`
   * 
   * **Initial value**: `auto`
   */
  "-webkit-mask-box-image-width"?: MaskBorderWidth<TLength> | undefined;
  /**
   * The **`mask-clip`** CSS property determines the area which is affected by a mask. The painted content of an element must be restricted to this area.
   * 
   * **Syntax**: `[ <box> | border | padding | content | text ]#`
   * 
   * **Initial value**: `border`
   */
  "-webkit-mask-clip"?: WebkitMaskClip | undefined;
  /**
   * The **`-webkit-mask-composite`** property specifies the manner in which multiple mask images applied to the same element are composited with one another. Mask images are composited in the opposite order that they are declared with the `-webkit-mask-image` property.
   * 
   * **Syntax**: `<composite-style>#`
   * 
   * **Initial value**: `source-over`
   */
  "-webkit-mask-composite"?: WebkitMaskComposite | undefined;
  /**
   * The **`mask-image`** CSS property sets the image that is used as mask layer for an element. By default this means the alpha channel of the mask image will be multiplied with the alpha channel of the element. This can be controlled with the `mask-mode` property.
   * 
   * **Syntax**: `<mask-reference>#`
   * 
   * **Initial value**: `none`
   */
  "-webkit-mask-image"?: WebkitMaskImage | undefined;
  /**
   * The **`mask-origin`** CSS property sets the origin of a mask.
   * 
   * **Syntax**: `[ <box> | border | padding | content ]#`
   * 
   * **Initial value**: `padding`
   */
  "-webkit-mask-origin"?: WebkitMaskOrigin | undefined;
  /**
   * The **`mask-position`** CSS property sets the initial position, relative to the mask position layer set by `mask-origin`, for each defined mask image.
   * 
   * **Syntax**: `<position>#`
   * 
   * **Initial value**: `0% 0%`
   */
  "-webkit-mask-position"?: WebkitMaskPosition<TLength> | undefined;
  /**
   * The `-webkit-mask-position-x` CSS property sets the initial horizontal position of a mask image.
   * 
   * **Syntax**: `[ <length-percentage> | left | center | right ]#`
   * 
   * **Initial value**: `0%`
   */
  "-webkit-mask-position-x"?: WebkitMaskPositionX<TLength> | undefined;
  /**
   * The `-webkit-mask-position-y` CSS property sets the initial vertical position of a mask image.
   * 
   * **Syntax**: `[ <length-percentage> | top | center | bottom ]#`
   * 
   * **Initial value**: `0%`
   */
  "-webkit-mask-position-y"?: WebkitMaskPositionY<TLength> | undefined;
  /**
   * The **`mask-repeat`** CSS property sets how mask images are repeated. A mask image can be repeated along the horizontal axis, the vertical axis, both axes, or not repeated at all.
   * 
   * **Syntax**: `<repeat-style>#`
   * 
   * **Initial value**: `repeat`
   */
  "-webkit-mask-repeat"?: WebkitMaskRepeat | undefined;
  /**
   * The `-webkit-mask-repeat-x` property specifies whether and how a mask image is repeated (tiled) horizontally.
   * 
   * **Syntax**: `repeat | no-repeat | space | round`
   * 
   * **Initial value**: `repeat`
   */
  "-webkit-mask-repeat-x"?: WebkitMaskRepeatX | undefined;
  /**
   * The `-webkit-mask-repeat-y` property sets whether and how a mask image is repeated (tiled) vertically.
   * 
   * **Syntax**: `repeat | no-repeat | space | round`
   * 
   * **Initial value**: `repeat`
   */
  "-webkit-mask-repeat-y"?: WebkitMaskRepeatY | undefined;
  /**
   * The **`mask-size`** CSS property specifies the sizes of the mask images. The size of the image can be fully or partially constrained in order to preserve its intrinsic ratio.
   * 
   * **Syntax**: `<bg-size>#`
   * 
   * **Initial value**: `auto auto`
   */
  "-webkit-mask-size"?: WebkitMaskSize<TLength> | undefined;
  /**
   * The **`max-inline-size`** CSS property defines the horizontal or vertical maximum size of an element's block, depending on its writing mode. It corresponds to either the `max-width` or the `max-height` property, depending on the value of `writing-mode`.
   * 
   * **Syntax**: `<'max-width'>`
   * 
   * **Initial value**: `none`
   */
  "-webkit-max-inline-size"?: MaxInlineSize<TLength> | undefined;
  /**
   * The **`order`** CSS property sets the order to lay out an item in a flex or grid container. Items in a container are sorted by ascending `order` value and then by their source code order.
   * 
   * **Syntax**: `<integer>`
   * 
   * **Initial value**: `0`
   */
  "-webkit-order"?: Order | undefined;
  /**
   * The `-webkit-overflow-scrolling` CSS property controls whether or not touch devices use momentum-based scrolling for a given element.
   * 
   * **Syntax**: `auto | touch`
   * 
   * **Initial value**: `auto`
   */
  "-webkit-overflow-scrolling"?: WebkitOverflowScrolling | undefined;
  /**
   * The **`padding-inline-end`** CSS property defines the logical inline end padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   */
  "-webkit-padding-end"?: PaddingInlineEnd<TLength> | undefined;
  /**
   * The **`padding-inline-start`** CSS property defines the logical inline start padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation.
   * 
   * **Syntax**: `<'padding-left'>`
   * 
   * **Initial value**: `0`
   */
  "-webkit-padding-start"?: PaddingInlineStart<TLength> | undefined;
  /**
   * The **`perspective`** CSS property determines the distance between the z=0 plane and the user in order to give a 3D-positioned element some perspective.
   * 
   * **Syntax**: `none | <length>`
   * 
   * **Initial value**: `none`
   */
  "-webkit-perspective"?: Perspective<TLength> | undefined;
  /**
   * The **`perspective-origin`** CSS property determines the position at which the viewer is looking. It is used as the _vanishing point_ by the `perspective` property.
   * 
   * **Syntax**: `<position>`
   * 
   * **Initial value**: `50% 50%`
   */
  "-webkit-perspective-origin"?: PerspectiveOrigin<TLength> | undefined;
  /**
   * The **`print-color-adjust`** CSS property sets what, if anything, the user agent may do to optimize the appearance of the element on the output device. By default, the browser is allowed to make any adjustments to the element's appearance it determines to be necessary and prudent given the type and capabilities of the output device.
   * 
   * **Syntax**: `economy | exact`
   * 
   * **Initial value**: `economy`
   */
  "-webkit-print-color-adjust"?: PrintColorAdjust | undefined;
  /**
   * The **`ruby-position`** CSS property defines the position of a ruby element relatives to its base element. It can be positioned over the element (`over`), under it (`under`), or between the characters on their right side (`inter-character`).
   * 
   * **Syntax**: `[ alternate || [ over | under ] ] | inter-character`
   * 
   * **Initial value**: `alternate`
   */
  "-webkit-ruby-position"?: RubyPosition | undefined;
  /**
   * The **`scroll-snap-type`** CSS property sets how strictly snap points are enforced on the scroll container in case there is one.
   * 
   * **Syntax**: `none | [ x | y | block | inline | both ] [ mandatory | proximity ]?`
   * 
   * **Initial value**: `none`
   */
  "-webkit-scroll-snap-type"?: ScrollSnapType | undefined;
  /**
   * The **`shape-margin`** CSS property sets a margin for a CSS shape created using `shape-outside`.
   * 
   * **Syntax**: `<length-percentage>`
   * 
   * **Initial value**: `0`
   */
  "-webkit-shape-margin"?: ShapeMargin<TLength> | undefined;
  /**
   * **`-webkit-tap-highlight-color`** is a non-standard CSS property that sets the color of the highlight that appears over a link while it's being tapped. The highlighting indicates to the user that their tap is being successfully recognized, and indicates which element they're tapping on.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `black`
   */
  "-webkit-tap-highlight-color"?: WebkitTapHighlightColor | undefined;
  /**
   * The **`text-combine-upright`** CSS property sets the combination of characters into the space of a single character. If the combined text is wider than 1em, the user agent must fit the contents within 1em. The resulting composition is treated as a single upright glyph for layout and decoration. This property only has an effect in vertical writing modes.
   * 
   * **Syntax**: `none | all | [ digits <integer>? ]`
   * 
   * **Initial value**: `none`
   */
  "-webkit-text-combine"?: TextCombineUpright | undefined;
  /**
   * The **`text-decoration-color`** CSS property sets the color of decorations added to text by `text-decoration-line`.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  "-webkit-text-decoration-color"?: TextDecorationColor | undefined;
  /**
   * The **`text-decoration-line`** CSS property sets the kind of decoration that is used on text in an element, such as an underline or overline.
   * 
   * **Syntax**: `none | [ underline || overline || line-through || blink ] | spelling-error | grammar-error`
   * 
   * **Initial value**: `none`
   */
  "-webkit-text-decoration-line"?: TextDecorationLine | undefined;
  /**
   * The **`text-decoration-skip`** CSS property sets what parts of an element's content any text decoration affecting the element must skip over. It controls all text decoration lines drawn by the element and also any text decoration lines drawn by its ancestors.
   * 
   * **Syntax**: `none | [ objects || [ spaces | [ leading-spaces || trailing-spaces ] ] || edges || box-decoration ]`
   * 
   * **Initial value**: `objects`
   */
  "-webkit-text-decoration-skip"?: TextDecorationSkip | undefined;
  /**
   * The **`text-decoration-style`** CSS property sets the style of the lines specified by `text-decoration-line`. The style applies to all lines that are set with `text-decoration-line`.
   * 
   * **Syntax**: `solid | double | dotted | dashed | wavy`
   * 
   * **Initial value**: `solid`
   */
  "-webkit-text-decoration-style"?: TextDecorationStyle | undefined;
  /**
   * The **`text-emphasis-color`** CSS property sets the color of emphasis marks. This value can also be set using the `text-emphasis` shorthand.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  "-webkit-text-emphasis-color"?: TextEmphasisColor | undefined;
  /**
   * The **`text-emphasis-position`** CSS property sets where emphasis marks are drawn. Like ruby text, if there isn't enough room for emphasis marks, the line height is increased.
   * 
   * **Syntax**: `[ over | under ] && [ right | left ]`
   * 
   * **Initial value**: `over right`
   */
  "-webkit-text-emphasis-position"?: TextEmphasisPosition | undefined;
  /**
   * The **`text-emphasis-style`** CSS property sets the appearance of emphasis marks. It can also be set, and reset, using the `text-emphasis` shorthand.
   * 
   * **Syntax**: `none | [ [ filled | open ] || [ dot | circle | double-circle | triangle | sesame ] ] | <string>`
   * 
   * **Initial value**: `none`
   */
  "-webkit-text-emphasis-style"?: TextEmphasisStyle | undefined;
  /**
   * The **`-webkit-text-fill-color`** CSS property specifies the fill color of characters of text. If this property is not set, the value of the `color` property is used.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  "-webkit-text-fill-color"?: WebkitTextFillColor | undefined;
  /**
   * The **`text-orientation`** CSS property sets the orientation of the text characters in a line. It only affects text in vertical mode (when `writing-mode` is not `horizontal-tb`). It is useful for controlling the display of languages that use vertical script, and also for making vertical table headers.
   * 
   * **Syntax**: `mixed | upright | sideways`
   * 
   * **Initial value**: `mixed`
   */
  "-webkit-text-orientation"?: TextOrientation | undefined;
  /**
   * The **`text-size-adjust`** CSS property controls the text inflation algorithm used on some smartphones and tablets. Other browsers will ignore this property.
   * 
   * **Syntax**: `none | auto | <percentage>`
   * 
   * **Initial value**: `auto` for smartphone browsers supporting inflation, `none` in other cases (and then not modifiable).
   */
  "-webkit-text-size-adjust"?: TextSizeAdjust | undefined;
  /**
   * The **`-webkit-text-stroke-color`** CSS property specifies the stroke color of characters of text. If this property is not set, the value of the `color` property is used.
   * 
   * **Syntax**: `<color>`
   * 
   * **Initial value**: `currentcolor`
   */
  "-webkit-text-stroke-color"?: WebkitTextStrokeColor | undefined;
  /**
   * The **`-webkit-text-stroke-width`** CSS property specifies the width of the stroke for text.
   * 
   * **Syntax**: `<length>`
   * 
   * **Initial value**: `0`
   */
  "-webkit-text-stroke-width"?: WebkitTextStrokeWidth<TLength> | undefined;
  /**
   * The **`text-underline-position`** CSS property specifies the position of the underline which is set using the `text-decoration` property's `underline` value.
   * 
   * **Syntax**: `auto | from-font | [ under || [ left | right ] ]`
   * 
   * **Initial value**: `auto`
   */
  "-webkit-text-underline-position"?: TextUnderlinePosition | undefined;
  /**
   * The `-webkit-touch-callout` CSS property controls the display of the default callout shown when you touch and hold a touch target.
   * 
   * **Syntax**: `default | none`
   * 
   * **Initial value**: `default`
   */
  "-webkit-touch-callout"?: WebkitTouchCallout | undefined;
  /**
   * The **`transform`** CSS property lets you rotate, scale, skew, or translate an element. It modifies the coordinate space of the CSS visual formatting model.
   * 
   * **Syntax**: `none | <transform-list>`
   * 
   * **Initial value**: `none`
   */
  "-webkit-transform"?: Transform | undefined;
  /**
   * The **`transform-origin`** CSS property sets the origin for an element's transformations.
   * 
   * **Syntax**: `[ <length-percentage> | left | center | right | top | bottom ] | [ [ <length-percentage> | left | center | right ] && [ <length-percentage> | top | center | bottom ] ] <length>?`
   * 
   * **Initial value**: `50% 50% 0`
   */
  "-webkit-transform-origin"?: TransformOrigin<TLength> | undefined;
  /**
   * The **`transform-style`** CSS property sets whether children of an element are positioned in the 3D space or are flattened in the plane of the element.
   * 
   * **Syntax**: `flat | preserve-3d`
   * 
   * **Initial value**: `flat`
   */
  "-webkit-transform-style"?: TransformStyle | undefined;
  /**
   * The **`transition-delay`** CSS property specifies the duration to wait before starting a property's transition effect when its value changes.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  "-webkit-transition-delay"?: TransitionDelay<TTime> | undefined;
  /**
   * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
   * 
   * **Syntax**: `<time>#`
   * 
   * **Initial value**: `0s`
   */
  "-webkit-transition-duration"?: TransitionDuration<TTime> | undefined;
  /**
   * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
   * 
   * **Syntax**: `none | <single-transition-property>#`
   * 
   * **Initial value**: all
   */
  "-webkit-transition-property"?: TransitionProperty | undefined;
  /**
   * The **`transition-timing-function`** CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect.
   * 
   * **Syntax**: `<easing-function>#`
   * 
   * **Initial value**: `ease`
   */
  "-webkit-transition-timing-function"?: TransitionTimingFunction | undefined;
  /**
   * **Syntax**: `read-only | read-write | read-write-plaintext-only`
   * 
   * **Initial value**: `read-only`
   */
  "-webkit-user-modify"?: WebkitUserModify | undefined;
  /**
   * The **`user-select`** CSS property controls whether the user can select text. This doesn't have any effect on content loaded as part of a browser's user interface (its chrome), except in textboxes.
   * 
   * **Syntax**: `auto | text | none | contain | all`
   * 
   * **Initial value**: `auto`
   */
  "-webkit-user-select"?: UserSelect | undefined;
  /**
   * The **`writing-mode`** CSS property sets whether lines of text are laid out horizontally or vertically, as well as the direction in which blocks progress. When set for an entire document, it should be set on the root element (`html` element for HTML documents).
   * 
   * **Syntax**: `horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr`
   * 
   * **Initial value**: `horizontal-tb`
   */
  "-webkit-writing-mode"?: WritingMode | undefined;
}

export interface VendorShorthandPropertiesHyphen<TLength = (string & {}) | 0, TTime = string & {}> {
  /**
   * The **`animation`** shorthand CSS property applies an animation between styles. It is a shorthand for `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`, and `animation-play-state`.
   * 
   * **Syntax**: `<single-animation>#`
   */
  "-moz-animation"?: Animation<TTime> | undefined;
  /**
   * The **`border-image`** CSS property draws an image around a given element. It replaces the element's regular border.
   * 
   * **Syntax**: `<'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>`
   */
  "-moz-border-image"?: BorderImage | undefined;
  /**
   * The **`column-rule`** shorthand CSS property sets the width, style, and color of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>`
   */
  "-moz-column-rule"?: ColumnRule<TLength> | undefined;
  /**
   * The **`columns`** CSS shorthand property sets the number of columns to use when drawing an element's contents, as well as those columns' widths.
   * 
   * **Syntax**: `<'column-width'> || <'column-count'>`
   */
  "-moz-columns"?: Columns<TLength> | undefined;
  /**
   * The **`transition`** CSS property is a shorthand property for `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.
   * 
   * **Syntax**: `<single-transition>#`
   */
  "-moz-transition"?: Transition<TTime> | undefined;
  /**
   * The **`-ms-content-zoom-limit`** CSS shorthand property is a Microsoft extension that specifies values for the `-ms-content-zoom-limit-min` and `-ms-content-zoom-limit-max` properties.
   * 
   * **Syntax**: `<'-ms-content-zoom-limit-min'> <'-ms-content-zoom-limit-max'>`
   */
  "-ms-content-zoom-limit"?: MsContentZoomLimit | undefined;
  /**
   * The **`-ms-content-zoom-snap`** CSS shorthand property is a Microsoft extension that specifies values for the `-ms-content-zoom-snap-type` and `-ms-content-zoom-snap-points` properties.
   * 
   * **Syntax**: `<'-ms-content-zoom-snap-type'> || <'-ms-content-zoom-snap-points'>`
   */
  "-ms-content-zoom-snap"?: MsContentZoomSnap | undefined;
  /**
   * The **`flex`** CSS shorthand property sets how a flex _item_ will grow or shrink to fit the space available in its flex container.
   * 
   * **Syntax**: `none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]`
   */
  "-ms-flex"?: Flex<TLength> | undefined;
  /**
   * The **\-ms-scroll-limit** CSS property is a Microsoft extension that specifies values for the `-ms-scroll-limit-x-min`, `-ms-scroll-limit-y-min`, `-ms-scroll-limit-x-max`, and `-ms-scroll-limit-y-max` properties.
   * 
   * **Syntax**: `<'-ms-scroll-limit-x-min'> <'-ms-scroll-limit-y-min'> <'-ms-scroll-limit-x-max'> <'-ms-scroll-limit-y-max'>`
   */
  "-ms-scroll-limit"?: MsScrollLimit | undefined;
  /**
   * The **`-ms-scroll-snap-x`** CSS shorthand property is a Microsoft extension that specifies values for the `-ms-scroll-snap-type` and `-ms-scroll-snap-points-x` properties.
   * 
   * **Syntax**: `<'-ms-scroll-snap-type'> <'-ms-scroll-snap-points-x'>`
   */
  "-ms-scroll-snap-x"?: MsScrollSnapX | undefined;
  /**
   * The **`-ms-scroll-snap-x`** CSS shorthand property is a Microsoft extension that specifies values for the `-ms-scroll-snap-type` and `-ms-scroll-snap-points-y` properties.
   * 
   * **Syntax**: `<'-ms-scroll-snap-type'> <'-ms-scroll-snap-points-y'>`
   */
  "-ms-scroll-snap-y"?: MsScrollSnapY | undefined;
  /**
   * The **`transition`** CSS property is a shorthand property for `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.
   * 
   * **Syntax**: `<single-transition>#`
   */
  "-ms-transition"?: Transition<TTime> | undefined;
  /**
   * The **`animation`** shorthand CSS property applies an animation between styles. It is a shorthand for `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`, and `animation-play-state`.
   * 
   * **Syntax**: `<single-animation>#`
   */
  "-webkit-animation"?: Animation<TTime> | undefined;
  /**
   * The **`-webkit-border-before`** CSS property is a shorthand property for setting the individual logical block start border property values in a single place in the style sheet.
   * 
   * **Syntax**: `<'border-width'> || <'border-style'> || <color>`
   */
  "-webkit-border-before"?: WebkitBorderBefore<TLength> | undefined;
  /**
   * The **`border-image`** CSS property draws an image around a given element. It replaces the element's regular border.
   * 
   * **Syntax**: `<'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>`
   */
  "-webkit-border-image"?: BorderImage | undefined;
  /**
   * The **`border-radius`** CSS property rounds the corners of an element's outer border edge. You can set a single radius to make circular corners, or two radii to make elliptical corners.
   * 
   * **Syntax**: `<length-percentage>{1,4} [ / <length-percentage>{1,4} ]?`
   */
  "-webkit-border-radius"?: BorderRadius<TLength> | undefined;
  /**
   * The **`column-rule`** shorthand CSS property sets the width, style, and color of the line drawn between columns in a multi-column layout.
   * 
   * **Syntax**: `<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>`
   */
  "-webkit-column-rule"?: ColumnRule<TLength> | undefined;
  /**
   * The **`columns`** CSS shorthand property sets the number of columns to use when drawing an element's contents, as well as those columns' widths.
   * 
   * **Syntax**: `<'column-width'> || <'column-count'>`
   */
  "-webkit-columns"?: Columns<TLength> | undefined;
  /**
   * The **`flex`** CSS shorthand property sets how a flex _item_ will grow or shrink to fit the space available in its flex container.
   * 
   * **Syntax**: `none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]`
   */
  "-webkit-flex"?: Flex<TLength> | undefined;
  /**
   * The **`flex-flow`** CSS shorthand property specifies the direction of a flex container, as well as its wrapping behavior.
   * 
   * **Syntax**: `<'flex-direction'> || <'flex-wrap'>`
   */
  "-webkit-flex-flow"?: FlexFlow | undefined;
  /**
   * The **`mask`** CSS shorthand property hides an element (partially or fully) by masking or clipping the image at specific points.
   * 
   * **Syntax**: `[ <mask-reference> || <position> [ / <bg-size> ]? || <repeat-style> || [ <box> | border | padding | content | text ] || [ <box> | border | padding | content ] ]#`
   */
  "-webkit-mask"?: WebkitMask<TLength> | undefined;
  /**
   * The **`mask-border`** CSS shorthand property lets you create a mask along the edge of an element's border.
   * 
   * **Syntax**: `<'mask-border-source'> || <'mask-border-slice'> [ / <'mask-border-width'>? [ / <'mask-border-outset'> ]? ]? || <'mask-border-repeat'> || <'mask-border-mode'>`
   */
  "-webkit-mask-box-image"?: MaskBorder | undefined;
  /**
   * The **`text-emphasis`** CSS property applies emphasis marks to text (except spaces and control characters). It is a shorthand for `text-emphasis-style` and `text-emphasis-color`.
   * 
   * **Syntax**: `<'text-emphasis-style'> || <'text-emphasis-color'>`
   */
  "-webkit-text-emphasis"?: TextEmphasis | undefined;
  /**
   * The **`-webkit-text-stroke`** CSS property specifies the width and color of strokes for text characters. This is a shorthand property for the longhand properties `-webkit-text-stroke-width` and `-webkit-text-stroke-color`.
   * 
   * **Syntax**: `<length> || <color>`
   */
  "-webkit-text-stroke"?: WebkitTextStroke<TLength> | undefined;
  /**
   * The **`transition`** CSS property is a shorthand property for `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.
   * 
   * **Syntax**: `<single-transition>#`
   */
  "-webkit-transition"?: Transition<TTime> | undefined;
}

export type AccentColor = Globals | Color___1 | "auto";

export type AlignContent = Globals | ContentDistribution | ContentPosition | "baseline" | "normal" | (string & {});

export type AlignItems = Globals | SelfPosition | "baseline" | "normal" | "stretch" | (string & {});

export type AlignSelf = Globals | SelfPosition | "auto" | "baseline" | "normal" | "stretch" | (string & {});

export type AlignTracks = Globals | ContentDistribution | ContentPosition | "baseline" | "normal" | (string & {});

export type AnimationComposition = Globals | (string & {});

export type AnimationTimeline = Globals | SingleAnimationTimeline | (string & {});

export type Appearance = Globals | CompatAuto | "auto" | "menulist-button" | "none" | "textfield";

export type AspectRatio = Globals | "auto" | (string & {}) | (number & {});

export type BackdropFilter = Globals | "none" | (string & {});

export type BackfaceVisibility = Globals | "hidden" | "visible";

export type BackgroundAttachment = Globals | Attachment | (string & {});

export type BackgroundBlendMode = Globals | BlendMode | (string & {});

export type BackgroundColor = Globals | Color___1;

export type BackgroundImage = Globals | "none" | (string & {});

export type BackgroundPositionX<TLength = (string & {}) | 0> = Globals | TLength | "center" | "left" | "right" | "x-end" | "x-start" | (string & {});

export type BackgroundPositionY<TLength = (string & {}) | 0> = Globals | TLength | "bottom" | "center" | "top" | "y-end" | "y-start" | (string & {});

export type BackgroundRepeat = Globals | RepeatStyle | (string & {});

export type BlockOverflow = Globals | "clip" | "ellipsis" | (string & {});

export type BlockSize<TLength = (string & {}) | 0> = Globals | TLength | "-moz-fit-content" | "-moz-max-content" | "-moz-min-content" | "-webkit-fill-available" | "auto" | "fit-content" | "max-content" | "min-content" | (string & {});

export type BorderBlockColor = Globals | Color___1 | (string & {});

export type BorderBlockEndColor = Globals | Color___1;

export type BorderBlockEndStyle = Globals | LineStyle;

export type BorderBlockEndWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength>;

export type BorderBlockStartColor = Globals | Color___1;

export type BorderBlockStartStyle = Globals | LineStyle;

export type BorderBlockStartWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength>;

export type BorderBlockStyle = Globals | LineStyle;

export type BorderBlockWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength>;

export type BorderBottomColor = Globals | Color___1;

export type BorderBottomStyle = Globals | LineStyle;

export type BorderBottomWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength>;

export type BorderCollapse = Globals | "collapse" | "separate";

export type BorderEndEndRadius<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type BorderEndStartRadius<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type BorderImageOutset<TLength = (string & {}) | 0> = Globals | TLength | (string & {}) | (number & {});

export type BorderImageRepeat = Globals | "repeat" | "round" | "space" | "stretch" | (string & {});

export type BorderImageSlice = Globals | (string & {}) | (number & {});

export type BorderImageSource = Globals | "none" | (string & {});

export type BorderImageWidth<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {}) | (number & {});

export type BorderInlineColor = Globals | Color___1 | (string & {});

export type BorderInlineEndColor = Globals | Color___1;

export type BorderInlineEndStyle = Globals | LineStyle;

export type BorderInlineEndWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength>;

export type BorderInlineStartColor = Globals | Color___1;

export type BorderInlineStartStyle = Globals | LineStyle;

export type BorderInlineStartWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength>;

export type BorderInlineStyle = Globals | LineStyle;

export type BorderInlineWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength>;

export type BorderLeftColor = Globals | Color___1;

export type BorderLeftStyle = Globals | LineStyle;

export type BorderLeftWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength>;

export type BorderRightColor = Globals | Color___1;

export type BorderRightStyle = Globals | LineStyle;

export type BorderRightWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength>;

export type BorderSpacing<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type BorderStartEndRadius<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type BorderStartStartRadius<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type BorderTopColor = Globals | Color___1;

export type BorderTopStyle = Globals | LineStyle;

export type BorderTopWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength>;

export type Bottom<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type BoxSizing = Globals | "border-box" | "content-box";

export type BreakAfter = Globals | "all" | "always" | "auto" | "avoid" | "avoid-column" | "avoid-page" | "avoid-region" | "column" | "left" | "page" | "recto" | "region" | "right" | "verso";

export type BreakBefore = Globals | "all" | "always" | "auto" | "avoid" | "avoid-column" | "avoid-page" | "avoid-region" | "column" | "left" | "page" | "recto" | "region" | "right" | "verso";

export type BreakInside = Globals | "auto" | "avoid" | "avoid-column" | "avoid-page" | "avoid-region";

export type CaptionSide = Globals | "block-end" | "block-start" | "bottom" | "inline-end" | "inline-start" | "top";

export type CaretColor = Globals | Color___1 | "auto";

export type Clear = Globals | "both" | "inline-end" | "inline-start" | "left" | "none" | "right";

export type PrintColorAdjust = Globals | "economy" | "exact";

export type ColorScheme = Globals | "dark" | "light" | "normal" | (string & {});

export type ColumnCount = Globals | "auto" | (number & {}) | (string & {});

export type ColumnFill = Globals | "auto" | "balance" | "balance-all";

export type ColumnGap<TLength = (string & {}) | 0> = Globals | TLength | "normal" | (string & {});

export type ColumnRuleColor = Globals | Color___1;

export type ColumnRuleStyle = Globals | LineStyle | (string & {});

export type ColumnRuleWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | (string & {});

export type ColumnSpan = Globals | "all" | "none";

export type ColumnWidth<TLength = (string & {}) | 0> = Globals | TLength | "auto";

export type Contain = Globals | "content" | "inline-size" | "layout" | "none" | "paint" | "size" | "strict" | "style" | (string & {});

export type Content = Globals | ContentList | "none" | "normal" | (string & {});

export type ContentVisibility = Globals | "auto" | "hidden" | "visible";

export type CounterIncrement = Globals | "none" | (string & {});

export type CounterReset = Globals | "none" | (string & {});

export type CounterSet = Globals | "none" | (string & {});

export type EmptyCells = Globals | "hide" | "show";

export type FlexBasis<TLength = (string & {}) | 0> = Globals | TLength | "-moz-fit-content" | "-moz-max-content" | "-moz-min-content" | "-webkit-auto" | "auto" | "content" | "fit-content" | "max-content" | "min-content" | (string & {});

export type FlexDirection = Globals | "column" | "column-reverse" | "row" | "row-reverse";

export type FlexGrow = Globals | (number & {}) | (string & {});

export type FlexShrink = Globals | (number & {}) | (string & {});

export type FlexWrap = Globals | "nowrap" | "wrap" | "wrap-reverse";

export type Float = Globals | "inline-end" | "inline-start" | "left" | "none" | "right";

export type FontFeatureSettings = Globals | "normal" | (string & {});

export type FontKerning = Globals | "auto" | "none" | "normal";

export type FontLanguageOverride = Globals | "normal" | (string & {});

export type FontOpticalSizing = Globals | "auto" | "none";

export type FontSmooth<TLength = (string & {}) | 0> = Globals | AbsoluteSize | TLength | "always" | "auto" | "never";

export type FontSynthesis = Globals | "none" | "small-caps" | "style" | "weight" | (string & {});

export type FontVariantAlternates = Globals | "historical-forms" | "normal" | (string & {});

export type FontVariantCaps = Globals | "all-petite-caps" | "all-small-caps" | "normal" | "petite-caps" | "small-caps" | "titling-caps" | "unicase";

export type FontVariantEastAsian = Globals | EastAsianVariantValues | "full-width" | "normal" | "proportional-width" | "ruby" | (string & {});

export type FontVariantLigatures = Globals | "common-ligatures" | "contextual" | "discretionary-ligatures" | "historical-ligatures" | "no-common-ligatures" | "no-contextual" | "no-discretionary-ligatures" | "no-historical-ligatures" | "none" | "normal" | (string & {});

export type FontVariantNumeric = Globals | "diagonal-fractions" | "lining-nums" | "normal" | "oldstyle-nums" | "ordinal" | "proportional-nums" | "slashed-zero" | "stacked-fractions" | "tabular-nums" | (string & {});

export type FontVariantPosition = Globals | "normal" | "sub" | "super";

export type FontVariationSettings = Globals | "normal" | (string & {});

export type ForcedColorAdjust = Globals | "auto" | "none";

export type GridAutoColumns<TLength = (string & {}) | 0> = Globals | TrackBreadth<TLength> | (string & {});

export type GridAutoFlow = Globals | "column" | "dense" | "row" | (string & {});

export type GridAutoRows<TLength = (string & {}) | 0> = Globals | TrackBreadth<TLength> | (string & {});

export type GridColumnEnd = Globals | GridLine;

export type GridColumnStart = Globals | GridLine;

export type GridRowEnd = Globals | GridLine;

export type GridRowStart = Globals | GridLine;

export type GridTemplateAreas = Globals | "none" | (string & {});

export type GridTemplateColumns<TLength = (string & {}) | 0> = Globals | TrackBreadth<TLength> | "none" | "subgrid" | (string & {});

export type GridTemplateRows<TLength = (string & {}) | 0> = Globals | TrackBreadth<TLength> | "none" | "subgrid" | (string & {});

export type HangingPunctuation = Globals | "allow-end" | "first" | "force-end" | "last" | "none" | (string & {});

export type Height<TLength = (string & {}) | 0> = Globals | TLength | "-moz-max-content" | "-moz-min-content" | "-webkit-fit-content" | "auto" | "fit-content" | "max-content" | "min-content" | (string & {});

export type HyphenateCharacter = Globals | "auto" | (string & {});

export type Hyphens = Globals | "auto" | "manual" | "none";

export type ImageOrientation = Globals | "flip" | "from-image" | (string & {});

export type ImageResolution = Globals | "from-image" | (string & {});

export type InitialLetter = Globals | "normal" | (string & {}) | (number & {});

export type InlineSize<TLength = (string & {}) | 0> = Globals | TLength | "-moz-fit-content" | "-moz-max-content" | "-moz-min-content" | "-webkit-fill-available" | "auto" | "fit-content" | "max-content" | "min-content" | (string & {});

export type InputSecurity = Globals | "auto" | "none";

export type Inset<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type Isolation = Globals | "auto" | "isolate";

export type JustifyContent = Globals | ContentDistribution | ContentPosition | "left" | "normal" | "right" | (string & {});

export type JustifyItems = Globals | SelfPosition | "baseline" | "left" | "legacy" | "normal" | "right" | "stretch" | (string & {});

export type JustifySelf = Globals | SelfPosition | "auto" | "baseline" | "left" | "normal" | "right" | "stretch" | (string & {});

export type JustifyTracks = Globals | ContentDistribution | ContentPosition | "left" | "normal" | "right" | (string & {});

export type Left<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type LineHeightStep<TLength = (string & {}) | 0> = Globals | TLength;

export type ListStyleImage = Globals | "none" | (string & {});

export type ListStylePosition = Globals | "inside" | "outside";

export type ListStyleType = Globals | "none" | (string & {});

export type MarginBlock<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type MarginBlockEnd<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type MarginBlockStart<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type MarginBottom<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type MarginInline<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type MarginInlineEnd<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type MarginInlineStart<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type MarginLeft<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type MarginRight<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type MarginTop<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type MaskBorderMode = Globals | "alpha" | "luminance";

export type MaskBorderOutset<TLength = (string & {}) | 0> = Globals | TLength | (string & {}) | (number & {});

export type MaskBorderRepeat = Globals | "repeat" | "round" | "space" | "stretch" | (string & {});

export type MaskBorderSlice = Globals | (string & {}) | (number & {});

export type MaskBorderSource = Globals | "none" | (string & {});

export type MaskBorderWidth<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {}) | (number & {});

export type MaskClip = Globals | GeometryBox | "no-clip" | (string & {});

export type MaskComposite = Globals | CompositingOperator | (string & {});

export type MaskImage = Globals | "none" | (string & {});

export type MaskMode = Globals | MaskingMode | (string & {});

export type MaskOrigin = Globals | GeometryBox | (string & {});

export type MaskPosition<TLength = (string & {}) | 0> = Globals | Position___1<TLength> | (string & {});

export type MaskRepeat = Globals | RepeatStyle | (string & {});

export type MaskSize<TLength = (string & {}) | 0> = Globals | BgSize<TLength> | (string & {});

export type MaskType = Globals | "alpha" | "luminance";

export type MathDepth = Globals | "auto-add" | (string & {}) | (number & {});

export type MathShift = Globals | "compact" | "normal";

export type MathStyle = Globals | "compact" | "normal";

export type MaxBlockSize<TLength = (string & {}) | 0> = Globals | TLength | "-moz-max-content" | "-moz-min-content" | "-webkit-fill-available" | "fit-content" | "max-content" | "min-content" | "none" | (string & {});

export type MaxHeight<TLength = (string & {}) | 0> = Globals | TLength | "-moz-fit-content" | "-moz-max-content" | "-moz-min-content" | "-webkit-fit-content" | "-webkit-max-content" | "-webkit-min-content" | "fit-content" | "intrinsic" | "max-content" | "min-content" | "none" | (string & {});

export type MaxInlineSize<TLength = (string & {}) | 0> = Globals | TLength | "-moz-fit-content" | "-moz-max-content" | "-moz-min-content" | "-webkit-fill-available" | "fit-content" | "max-content" | "min-content" | "none" | (string & {});

export type MaxLines = Globals | "none" | (number & {}) | (string & {});

export type MaxWidth<TLength = (string & {}) | 0> = Globals | TLength | "-moz-fit-content" | "-moz-max-content" | "-moz-min-content" | "-webkit-fit-content" | "-webkit-max-content" | "-webkit-min-content" | "fit-content" | "intrinsic" | "max-content" | "min-content" | "none" | (string & {});

export type MinBlockSize<TLength = (string & {}) | 0> = Globals | TLength | "-moz-max-content" | "-moz-min-content" | "-webkit-fill-available" | "auto" | "fit-content" | "max-content" | "min-content" | (string & {});

export type MinHeight<TLength = (string & {}) | 0> = Globals | TLength | "-moz-fit-content" | "-moz-max-content" | "-moz-min-content" | "-webkit-fit-content" | "-webkit-max-content" | "-webkit-min-content" | "auto" | "fit-content" | "intrinsic" | "max-content" | "min-content" | (string & {});

export type MinInlineSize<TLength = (string & {}) | 0> = Globals | TLength | "-moz-fit-content" | "-moz-max-content" | "-moz-min-content" | "-webkit-fill-available" | "auto" | "fit-content" | "max-content" | "min-content" | (string & {});

export type MinWidth<TLength = (string & {}) | 0> = Globals | TLength | "-moz-fit-content" | "-moz-max-content" | "-moz-min-content" | "-webkit-fill-available" | "-webkit-fit-content" | "-webkit-max-content" | "-webkit-min-content" | "auto" | "fit-content" | "intrinsic" | "max-content" | "min-content" | "min-intrinsic" | (string & {});

export type MixBlendMode = Globals | BlendMode | "plus-lighter";

export type OffsetDistance<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type OffsetPath = Globals | GeometryBox | "none" | (string & {});

export type OffsetRotate = Globals | "auto" | "reverse" | (string & {});

export type OffsetAnchor<TLength = (string & {}) | 0> = Globals | Position___1<TLength> | "auto";

export type Order = Globals | (number & {}) | (string & {});

export type Orphans = Globals | (number & {}) | (string & {});

export type OutlineOffset<TLength = (string & {}) | 0> = Globals | TLength;

export type OverflowAnchor = Globals | "auto" | "none";

export type OverflowBlock = Globals | "auto" | "clip" | "hidden" | "scroll" | "visible";

export type OverflowClipBox = Globals | "content-box" | "padding-box";

export type OverflowClipMargin<TLength = (string & {}) | 0> = Globals | VisualBox | TLength | (string & {});

export type OverflowInline = Globals | "auto" | "clip" | "hidden" | "scroll" | "visible";

export type OverflowWrap = Globals | "anywhere" | "break-word" | "normal";

export type OverflowX = Globals | "-moz-hidden-unscrollable" | "auto" | "clip" | "hidden" | "scroll" | "visible";

export type OverflowY = Globals | "-moz-hidden-unscrollable" | "auto" | "clip" | "hidden" | "scroll" | "visible";

export type OverscrollBehaviorBlock = Globals | "auto" | "contain" | "none";

export type OverscrollBehaviorInline = Globals | "auto" | "contain" | "none";

export type OverscrollBehaviorX = Globals | "auto" | "contain" | "none";

export type OverscrollBehaviorY = Globals | "auto" | "contain" | "none";

export type PaddingBlock<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type PaddingBlockEnd<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type PaddingBlockStart<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type PaddingBottom<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type PaddingInline<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type PaddingInlineEnd<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type PaddingInlineStart<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type PaddingLeft<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type PaddingRight<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type PaddingTop<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type PageBreakAfter = Globals | "always" | "auto" | "avoid" | "left" | "recto" | "right" | "verso";

export type PageBreakBefore = Globals | "always" | "auto" | "avoid" | "left" | "recto" | "right" | "verso";

export type PageBreakInside = Globals | "auto" | "avoid";

export type Perspective<TLength = (string & {}) | 0> = Globals | TLength | "none";

export type PerspectiveOrigin<TLength = (string & {}) | 0> = Globals | Position___1<TLength>;

export type PlaceContent = Globals | ContentDistribution | ContentPosition | "baseline" | "normal" | (string & {});

export type Position = Globals | "-webkit-sticky" | "absolute" | "fixed" | "relative" | "static" | "sticky";

export type Quotes = Globals | "auto" | "none" | (string & {});

export type Resize = Globals | "block" | "both" | "horizontal" | "inline" | "none" | "vertical";

export type Right<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type Rotate = Globals | "none" | (string & {});

export type RowGap<TLength = (string & {}) | 0> = Globals | TLength | "normal" | (string & {});

export type RubyAlign = Globals | "center" | "space-around" | "space-between" | "start";

export type RubyMerge = Globals | "auto" | "collapse" | "separate";

export type RubyPosition = Globals | "alternate" | "inter-character" | "over" | "under" | (string & {});

export type Scale = Globals | "none" | (string & {}) | (number & {});

export type ScrollBehavior = Globals | "auto" | "smooth";

export type ScrollMargin<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type ScrollMarginBlock<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type ScrollMarginBlockEnd<TLength = (string & {}) | 0> = Globals | TLength;

export type ScrollMarginBlockStart<TLength = (string & {}) | 0> = Globals | TLength;

export type ScrollMarginBottom<TLength = (string & {}) | 0> = Globals | TLength;

export type ScrollMarginInline<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type ScrollMarginInlineEnd<TLength = (string & {}) | 0> = Globals | TLength;

export type ScrollMarginInlineStart<TLength = (string & {}) | 0> = Globals | TLength;

export type ScrollMarginLeft<TLength = (string & {}) | 0> = Globals | TLength;

export type ScrollMarginRight<TLength = (string & {}) | 0> = Globals | TLength;

export type ScrollMarginTop<TLength = (string & {}) | 0> = Globals | TLength;

export type ScrollPadding<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type ScrollPaddingBlock<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type ScrollPaddingBlockEnd<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type ScrollPaddingBlockStart<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type ScrollPaddingBottom<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type ScrollPaddingInline<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type ScrollPaddingInlineEnd<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type ScrollPaddingInlineStart<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type ScrollPaddingLeft<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type ScrollPaddingRight<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type ScrollPaddingTop<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type ScrollSnapAlign = Globals | "center" | "end" | "none" | "start" | (string & {});

export type ScrollSnapStop = Globals | "always" | "normal";

export type ScrollSnapType = Globals | "block" | "both" | "inline" | "none" | "x" | "y" | (string & {});

export type ScrollbarColor = Globals | "auto" | (string & {});

export type ScrollbarGutter = Globals | "auto" | "stable" | (string & {});

export type ScrollbarWidth = Globals | "auto" | "none" | "thin";

export type ShapeImageThreshold = Globals | (string & {}) | (number & {});

export type ShapeMargin<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type ShapeOutside = Globals | Box | "margin-box" | "none" | (string & {});

export type TableLayout = Globals | "auto" | "fixed";

export type TextAlign = Globals | "center" | "end" | "justify" | "left" | "match-parent" | "right" | "start";

export type TextCombineUpright = Globals | "all" | "none" | (string & {});

export type TextDecorationSkip = Globals | "box-decoration" | "edges" | "leading-spaces" | "none" | "objects" | "spaces" | "trailing-spaces" | (string & {});

export type TextDecorationSkipInk = Globals | "all" | "auto" | "none";

export type TextDecorationThickness<TLength = (string & {}) | 0> = Globals | TLength | "auto" | "from-font" | (string & {});

export type TextEmphasisColor = Globals | Color___1;

export type TextEmphasisPosition = Globals | (string & {});

export type TextEmphasisStyle = Globals | "circle" | "dot" | "double-circle" | "filled" | "none" | "open" | "sesame" | "triangle" | (string & {});

export type TextIndent<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type TextJustify = Globals | "auto" | "inter-character" | "inter-word" | "none";

export type TextOrientation = Globals | "mixed" | "sideways" | "upright";

export type TextShadow = Globals | "none" | (string & {});

export type TextSizeAdjust = Globals | "auto" | "none" | (string & {});

export type TextTransform = Globals | "capitalize" | "full-size-kana" | "full-width" | "lowercase" | "none" | "uppercase";

export type TextUnderlineOffset<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type TextUnderlinePosition = Globals | "auto" | "from-font" | "left" | "right" | "under" | (string & {});

export type Top<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type TouchAction = Globals | "-ms-manipulation" | "-ms-none" | "-ms-pinch-zoom" | "auto" | "manipulation" | "none" | "pan-down" | "pan-left" | "pan-right" | "pan-up" | "pan-x" | "pan-y" | "pinch-zoom" | (string & {});

export type TransformBox = Globals | "border-box" | "content-box" | "fill-box" | "stroke-box" | "view-box";

export type TransformStyle = Globals | "flat" | "preserve-3d";

export type Translate<TLength = (string & {}) | 0> = Globals | TLength | "none" | (string & {});

export type VerticalAlign<TLength = (string & {}) | 0> = Globals | TLength | "baseline" | "bottom" | "middle" | "sub" | "super" | "text-bottom" | "text-top" | "top" | (string & {});

export type Widows = Globals | (number & {}) | (string & {});

export type Width<TLength = (string & {}) | 0> = Globals | TLength | "-moz-fit-content" | "-moz-max-content" | "-moz-min-content" | "-webkit-fit-content" | "-webkit-max-content" | "auto" | "fit-content" | "intrinsic" | "max-content" | "min-content" | "min-intrinsic" | (string & {});

export type WillChange = Globals | AnimateableFeature | "auto" | (string & {});

export type WordBreak = Globals | "break-all" | "break-word" | "keep-all" | "normal";

export type WordWrap = Globals | "break-word" | "normal";

export type ZIndex = Globals | "auto" | (number & {}) | (string & {});

export type Zoom = Globals | "normal" | "reset" | (string & {}) | (number & {});

export type All = Globals;

export type Background<TLength = (string & {}) | 0> = Globals | FinalBgLayer<TLength> | (string & {});

export type BackgroundPosition<TLength = (string & {}) | 0> = Globals | BgPosition<TLength> | (string & {});

export type Border<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type BorderBlock<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type BorderBlockEnd<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type BorderBlockStart<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type BorderBottom<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type BorderColor = Globals | Color___1 | (string & {});

export type BorderInline<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type BorderInlineEnd<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type BorderInlineStart<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type BorderLeft<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type BorderRight<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type BorderStyle = Globals | LineStyle | (string & {});

export type BorderTop<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type BorderWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | (string & {});

export type ColumnRule<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type Columns<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {}) | (number & {});

export type Flex<TLength = (string & {}) | 0> = Globals | TLength | "auto" | "content" | "fit-content" | "max-content" | "min-content" | "none" | (string & {}) | (number & {});

export type FlexFlow = Globals | "column" | "column-reverse" | "nowrap" | "row" | "row-reverse" | "wrap" | "wrap-reverse" | (string & {});

export type Gap<TLength = (string & {}) | 0> = Globals | TLength | "normal" | (string & {});

export type Grid = Globals | "none" | (string & {});

export type GridArea = Globals | GridLine | (string & {});

export type GridColumn = Globals | GridLine | (string & {});

export type GridRow = Globals | GridLine | (string & {});

export type GridTemplate = Globals | "none" | (string & {});

export type LineClamp = Globals | "none" | (number & {}) | (string & {});

export type ListStyle = Globals | "inside" | "none" | "outside" | (string & {});

export type Margin<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

export type MaskBorder = Globals | "alpha" | "luminance" | "none" | "repeat" | "round" | "space" | "stretch" | (string & {}) | (number & {});

export type Offset<TLength = (string & {}) | 0> = Globals | Position___1<TLength> | GeometryBox | "auto" | "none" | (string & {});

export type OverscrollBehavior = Globals | "auto" | "contain" | "none" | (string & {});

export type Padding<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type PlaceItems = Globals | SelfPosition | "baseline" | "normal" | "stretch" | (string & {});

export type PlaceSelf = Globals | SelfPosition | "auto" | "baseline" | "normal" | "stretch" | (string & {});

export type TextEmphasis = Globals | Color___1 | "circle" | "dot" | "double-circle" | "filled" | "none" | "open" | "sesame" | "triangle" | (string & {});

export type MozAppearance = Globals | "-moz-mac-unified-toolbar" | "-moz-win-borderless-glass" | "-moz-win-browsertabbar-toolbox" | "-moz-win-communications-toolbox" | "-moz-win-communicationstext" | "-moz-win-exclude-glass" | "-moz-win-glass" | "-moz-win-media-toolbox" | "-moz-win-mediatext" | "-moz-window-button-box" | "-moz-window-button-box-maximized" | "-moz-window-button-close" | "-moz-window-button-maximize" | "-moz-window-button-minimize" | "-moz-window-button-restore" | "-moz-window-frame-bottom" | "-moz-window-frame-left" | "-moz-window-frame-right" | "-moz-window-titlebar" | "-moz-window-titlebar-maximized" | "button" | "button-arrow-down" | "button-arrow-next" | "button-arrow-previous" | "button-arrow-up" | "button-bevel" | "button-focus" | "caret" | "checkbox" | "checkbox-container" | "checkbox-label" | "checkmenuitem" | "dualbutton" | "groupbox" | "listbox" | "listitem" | "menuarrow" | "menubar" | "menucheckbox" | "menuimage" | "menuitem" | "menuitemtext" | "menulist" | "menulist-button" | "menulist-text" | "menulist-textfield" | "menupopup" | "menuradio" | "menuseparator" | "meterbar" | "meterchunk" | "none" | "progressbar" | "progressbar-vertical" | "progresschunk" | "progresschunk-vertical" | "radio" | "radio-container" | "radio-label" | "radiomenuitem" | "range" | "range-thumb" | "resizer" | "resizerpanel" | "scale-horizontal" | "scale-vertical" | "scalethumb-horizontal" | "scalethumb-vertical" | "scalethumbend" | "scalethumbstart" | "scalethumbtick" | "scrollbarbutton-down" | "scrollbarbutton-left" | "scrollbarbutton-right" | "scrollbarbutton-up" | "scrollbarthumb-horizontal" | "scrollbarthumb-vertical" | "scrollbartrack-horizontal" | "scrollbartrack-vertical" | "searchfield" | "separator" | "sheet" | "spinner" | "spinner-downbutton" | "spinner-textfield" | "spinner-upbutton" | "splitter" | "statusbar" | "statusbarpanel" | "tab" | "tab-scroll-arrow-back" | "tab-scroll-arrow-forward" | "tabpanel" | "tabpanels" | "textfield" | "textfield-multiline" | "toolbar" | "toolbarbutton" | "toolbarbutton-dropdown" | "toolbargripper" | "toolbox" | "tooltip" | "treeheader" | "treeheadercell" | "treeheadersortarrow" | "treeitem" | "treeline" | "treetwisty" | "treetwistyopen" | "treeview";

export type MozBorderBottomColors = Globals | Color___1 | "none" | (string & {});

export type MozBorderLeftColors = Globals | Color___1 | "none" | (string & {});

export type MozBorderRightColors = Globals | Color___1 | "none" | (string & {});

export type MozBorderTopColors = Globals | Color___1 | "none" | (string & {});

export type MozContextProperties = Globals | "fill" | "fill-opacity" | "none" | "stroke" | "stroke-opacity" | (string & {});

export type MozImageRegion = Globals | "auto" | (string & {});

export type MozOrient = Globals | "block" | "horizontal" | "inline" | "vertical";

export type MozStackSizing = Globals | "ignore" | "stretch-to-fit";

export type MozTextBlink = Globals | "blink" | "none";

export type MozUserFocus = Globals | "ignore" | "none" | "normal" | "select-after" | "select-all" | "select-before" | "select-menu" | "select-same";

export type MozUserModify = Globals | "read-only" | "read-write" | "write-only";

export type MozWindowDragging = Globals | "drag" | "no-drag";

export type MozWindowShadow = Globals | "default" | "menu" | "none" | "sheet" | "tooltip";

export type MsAccelerator = Globals | "false" | "true";

export type MsBlockProgression = Globals | "bt" | "lr" | "rl" | "tb";

export type MsContentZoomChaining = Globals | "chained" | "none";

export type MsContentZoomLimitMax = Globals | (string & {});

export type MsContentZoomLimitMin = Globals | (string & {});

export type MsContentZoomSnapPoints = Globals | (string & {});

export type MsContentZoomSnapType = Globals | "mandatory" | "none" | "proximity";

export type MsContentZooming = Globals | "none" | "zoom";

export type MsFilter = Globals | (string & {});

export type MsFlowFrom = Globals | "none" | (string & {});

export type MsFlowInto = Globals | "none" | (string & {});

export type MsGridColumns<TLength = (string & {}) | 0> = Globals | TrackBreadth<TLength> | "none" | (string & {});

export type MsGridRows<TLength = (string & {}) | 0> = Globals | TrackBreadth<TLength> | "none" | (string & {});

export type MsHighContrastAdjust = Globals | "auto" | "none";

export type MsHyphenateLimitChars = Globals | "auto" | (string & {}) | (number & {});

export type MsHyphenateLimitLines = Globals | "no-limit" | (number & {}) | (string & {});

export type MsHyphenateLimitZone<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

export type MsImeAlign = Globals | "after" | "auto";

export type MsOverflowStyle = Globals | "-ms-autohiding-scrollbar" | "auto" | "none" | "scrollbar";

export type MsScrollChaining = Globals | "chained" | "none";

export type MsScrollLimitXMax<TLength = (string & {}) | 0> = Globals | TLength | "auto";

export type MsScrollLimitXMin<TLength = (string & {}) | 0> = Globals | TLength;

export type MsScrollLimitYMax<TLength = (string & {}) | 0> = Globals | TLength | "auto";

export type MsScrollLimitYMin<TLength = (string & {}) | 0> = Globals | TLength;

export type MsScrollRails = Globals | "none" | "railed";

export type MsScrollSnapPointsX = Globals | (string & {});

export type MsScrollSnapPointsY = Globals | (string & {});

export type MsScrollSnapType = Globals | "mandatory" | "none" | "proximity";

export type MsScrollTranslation = Globals | "none" | "vertical-to-horizontal";

export type MsScrollbar3dlightColor = Globals | Color___1;

export type MsScrollbarArrowColor = Globals | Color___1;

export type MsScrollbarBaseColor = Globals | Color___1;

export type MsScrollbarDarkshadowColor = Globals | Color___1;

export type MsScrollbarFaceColor = Globals | Color___1;

export type MsScrollbarHighlightColor = Globals | Color___1;

export type MsScrollbarShadowColor = Globals | Color___1;

export type MsScrollbarTrackColor = Globals | Color___1;

export type MsTextAutospace = Globals | "ideograph-alpha" | "ideograph-numeric" | "ideograph-parenthesis" | "ideograph-space" | "none";

export type MsTouchSelect = Globals | "grippers" | "none";

export type MsUserSelect = Globals | "element" | "none" | "text";

export type MsWrapFlow = Globals | "auto" | "both" | "clear" | "end" | "maximum" | "start";

export type MsWrapMargin<TLength = (string & {}) | 0> = Globals | TLength;

export type MsWrapThrough = Globals | "none" | "wrap";

export type WebkitAppearance = Globals | "-apple-pay-button" | "button" | "button-bevel" | "caret" | "checkbox" | "default-button" | "inner-spin-button" | "listbox" | "listitem" | "media-controls-background" | "media-controls-fullscreen-background" | "media-current-time-display" | "media-enter-fullscreen-button" | "media-exit-fullscreen-button" | "media-fullscreen-button" | "media-mute-button" | "media-overlay-play-button" | "media-play-button" | "media-seek-back-button" | "media-seek-forward-button" | "media-slider" | "media-sliderthumb" | "media-time-remaining-display" | "media-toggle-closed-captions-button" | "media-volume-slider" | "media-volume-slider-container" | "media-volume-sliderthumb" | "menulist" | "menulist-button" | "menulist-text" | "menulist-textfield" | "meter" | "none" | "progress-bar" | "progress-bar-value" | "push-button" | "radio" | "searchfield" | "searchfield-cancel-button" | "searchfield-decoration" | "searchfield-results-button" | "searchfield-results-decoration" | "slider-horizontal" | "slider-vertical" | "sliderthumb-horizontal" | "sliderthumb-vertical" | "square-button" | "textarea" | "textfield";

export type WebkitBorderBeforeColor = Globals | Color___1;

export type WebkitBorderBeforeStyle = Globals | LineStyle | (string & {});

export type WebkitBorderBeforeWidth<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | (string & {});

export type WebkitBoxReflect<TLength = (string & {}) | 0> = Globals | TLength | "above" | "below" | "left" | "right" | (string & {});

export type WebkitLineClamp = Globals | "none" | (number & {}) | (string & {});

export type WebkitMaskAttachment = Globals | Attachment | (string & {});

export type WebkitMaskClip = Globals | Box | "border" | "content" | "padding" | "text" | (string & {});

export type WebkitMaskComposite = Globals | CompositeStyle | (string & {});

export type WebkitMaskImage = Globals | "none" | (string & {});

export type WebkitMaskOrigin = Globals | Box | "border" | "content" | "padding" | (string & {});

export type WebkitMaskPosition<TLength = (string & {}) | 0> = Globals | Position___1<TLength> | (string & {});

export type WebkitMaskPositionX<TLength = (string & {}) | 0> = Globals | TLength | "center" | "left" | "right" | (string & {});

export type WebkitMaskPositionY<TLength = (string & {}) | 0> = Globals | TLength | "bottom" | "center" | "top" | (string & {});

export type WebkitMaskRepeat = Globals | RepeatStyle | (string & {});

export type WebkitMaskRepeatX = Globals | "no-repeat" | "repeat" | "round" | "space";

export type WebkitMaskRepeatY = Globals | "no-repeat" | "repeat" | "round" | "space";

export type WebkitMaskSize<TLength = (string & {}) | 0> = Globals | BgSize<TLength> | (string & {});

export type WebkitOverflowScrolling = Globals | "auto" | "touch";

export type WebkitTapHighlightColor = Globals | Color___1;

export type WebkitTextFillColor = Globals | Color___1;

export type WebkitTextStrokeColor = Globals | Color___1;

export type WebkitTextStrokeWidth<TLength = (string & {}) | 0> = Globals | TLength;

export type WebkitTouchCallout = Globals | "default" | "none";

export type WebkitUserModify = Globals | "read-only" | "read-write" | "read-write-plaintext-only";

export type MsContentZoomLimit = Globals | (string & {});

export type MsContentZoomSnap = Globals | "mandatory" | "none" | "proximity" | (string & {});

export type MsScrollLimit = Globals | (string & {});

export type MsScrollSnapX = Globals | (string & {});

export type MsScrollSnapY = Globals | (string & {});

export type WebkitBorderBefore<TLength = (string & {}) | 0> = Globals | LineWidth<TLength> | LineStyle | Color___1 | (string & {});

export type WebkitMask<TLength = (string & {}) | 0> = Globals | Position___1<TLength> | RepeatStyle | Box | "border" | "content" | "none" | "padding" | "text" | (string & {});

export type WebkitTextStroke<TLength = (string & {}) | 0> = Globals | Color___1 | TLength | (string & {});

export type Globals = "-moz-initial" | "inherit" | "initial" | "revert" | "revert-layer" | "unset";

export type Position___1<TLength> = TLength | "bottom" | "center" | "left" | "right" | "top" | (string & {});

export type Box = "border-box" | "content-box" | "padding-box";

export type BgSize<TLength> = TLength | "auto" | "contain" | "cover" | (string & {});

export type Color___1 = NamedColor | DeprecatedSystemColor | "currentcolor" | (string & {});

export type LineStyle = "dashed" | "dotted" | "double" | "groove" | "hidden" | "inset" | "none" | "outset" | "ridge" | "solid";

export type LineWidth<TLength> = TLength | "medium" | "thick" | "thin";

export type SingleAnimation<TTime> = EasingFunction | SingleAnimationDirection | SingleAnimationFillMode | TTime | "infinite" | "none" | "paused" | "running" | (string & {}) | (number & {});

export type SingleAnimationDirection = "alternate" | "alternate-reverse" | "normal" | "reverse";

export type SingleAnimationFillMode = "backwards" | "both" | "forwards" | "none";

export type EasingFunction = CubicBezierTimingFunction | StepTimingFunction | "linear";

export type SingleTransition<TTime> = EasingFunction | TTime | "all" | "none" | (string & {});

export type GeometryBox = Box | "fill-box" | "margin-box" | "stroke-box" | "view-box";

export type DisplayOutside = "block" | "inline" | "run-in";

export type DisplayInside = "-ms-flexbox" | "-ms-grid" | "-webkit-flex" | "flex" | "flow" | "flow-root" | "grid" | "ruby" | "table";

export type DisplayInternal = "ruby-base" | "ruby-base-container" | "ruby-text" | "ruby-text-container" | "table-caption" | "table-cell" | "table-column" | "table-column-group" | "table-footer-group" | "table-header-group" | "table-row" | "table-row-group";

export type DisplayLegacy = "-ms-inline-flexbox" | "-ms-inline-grid" | "-webkit-inline-flex" | "inline-block" | "inline-flex" | "inline-grid" | "inline-list-item" | "inline-table";

export type Paint = Color___1 | "child" | "context-fill" | "context-stroke" | "none" | (string & {});

export type GenericFamily = "cursive" | "fantasy" | "monospace" | "sans-serif" | "serif";

export type AbsoluteSize = "large" | "medium" | "small" | "x-large" | "x-small" | "xx-large" | "xx-small" | "xxx-large";

export type FontStretchAbsolute = "condensed" | "expanded" | "extra-condensed" | "extra-expanded" | "normal" | "semi-condensed" | "semi-expanded" | "ultra-condensed" | "ultra-expanded" | (string & {});

export type EastAsianVariantValues = "jis04" | "jis78" | "jis83" | "jis90" | "simplified" | "traditional";

export type FontWeightAbsolute = "bold" | "normal" | (number & {}) | (string & {});

export type MaskLayer<TLength> = Position___1<TLength> | RepeatStyle | GeometryBox | CompositingOperator | MaskingMode | "no-clip" | "none" | (string & {});

export type Dasharray<TLength> = TLength | (string & {}) | (number & {});

export type ContentDistribution = "space-around" | "space-between" | "space-evenly" | "stretch";

export type ContentPosition = "center" | "end" | "flex-end" | "flex-start" | "start";

export type SelfPosition = "center" | "end" | "flex-end" | "flex-start" | "self-end" | "self-start" | "start";

export type SingleAnimationTimeline = "auto" | "none" | (string & {});

export type CompatAuto = "button" | "checkbox" | "listbox" | "menulist" | "meter" | "progress-bar" | "push-button" | "radio" | "searchfield" | "slider-horizontal" | "square-button" | "textarea";

export type Attachment = "fixed" | "local" | "scroll";

export type BlendMode = "color" | "color-burn" | "color-dodge" | "darken" | "difference" | "exclusion" | "hard-light" | "hue" | "lighten" | "luminosity" | "multiply" | "normal" | "overlay" | "saturation" | "screen" | "soft-light";

export type RepeatStyle = "no-repeat" | "repeat" | "repeat-x" | "repeat-y" | "round" | "space" | (string & {});

export type ContentList = Quote | "contents" | (string & {});

export type TrackBreadth<TLength> = TLength | "auto" | "max-content" | "min-content" | (string & {});

export type GridLine = "auto" | (string & {}) | (number & {});

export type CompositingOperator = "add" | "exclude" | "intersect" | "subtract";

export type MaskingMode = "alpha" | "luminance" | "match-source";

export type VisualBox = "border-box" | "content-box" | "padding-box";

export type AnimateableFeature = "contents" | "scroll-position" | (string & {});

export type FinalBgLayer<TLength> = Color___1 | BgPosition<TLength> | RepeatStyle | Attachment | Box | "none" | (string & {});

export type BgPosition<TLength> = TLength | "bottom" | "center" | "left" | "right" | "top" | (string & {});

export type CompositeStyle = "clear" | "copy" | "destination-atop" | "destination-in" | "destination-out" | "destination-over" | "source-atop" | "source-in" | "source-out" | "source-over" | "xor";

export type NamedColor = "aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "rebeccapurple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "transparent" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen";

export type DeprecatedSystemColor = "ActiveBorder" | "ActiveCaption" | "AppWorkspace" | "Background" | "ButtonFace" | "ButtonHighlight" | "ButtonShadow" | "ButtonText" | "CaptionText" | "GrayText" | "Highlight" | "HighlightText" | "InactiveBorder" | "InactiveCaption" | "InactiveCaptionText" | "InfoBackground" | "InfoText" | "Menu" | "MenuText" | "Scrollbar" | "ThreeDDarkShadow" | "ThreeDFace" | "ThreeDHighlight" | "ThreeDLightShadow" | "ThreeDShadow" | "Window" | "WindowFrame" | "WindowText";

export type CubicBezierTimingFunction = "ease" | "ease-in" | "ease-in-out" | "ease-out" | (string & {});

export type StepTimingFunction = "step-end" | "step-start" | (string & {});

export type Quote = "close-quote" | "no-close-quote" | "no-open-quote" | "open-quote";