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
export interface PiletCustomApi extends PiletLocaleApi, PiletDashboardApi, PiletMenuApi, PiletNotificationsApi, PiletModalsApi, PiletFeedsApi {}

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
  Extension<TName>(props: ExtensionSlotProps<TName>): ReactElement | null;
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
  showNotification(content: string | ReactElement<any, any> | AnyComponent<NotificationComponentProps>, options?: NotificationOptions): Disposable;
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
export type AnyComponent<T> = ComponentType<T> | FirstParametersOf<ComponentConverters<T>>;

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
  children: ReactNode;
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

export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
  type: T;
  props: P;
  key: Key | null;
}

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
  <TProps>(component: ComponentType<TProps & FeedConnectorProps<TData>>): FC<TProps>;
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

export type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;

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
} = {}, UrlState = any> extends RouteComponentProps<UrlParams, {}, UrlState>, BaseComponentProps {}

export type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;

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
  children?: ReactNode;
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
  children?: ReactNode;
  /**
   * Defines what should be rendered when no components are available
   * for the specified extension.
   */
  empty?(): ReactNode;
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
  render?(nodes: Array<ReactNode>): ReactElement<any, any> | null;
  /**
   * The custom parameters for the given extension.
   */
  params?: TParams;
  /**
   * The name of the extension to render.
   */
  name: TName;
}

export type Key = string | number;

export type JSXElementConstructor<P> = ((props: P) => ReactElement<any, any> | null) | (new (props: P) => Component<any, any>);

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

export type FC<P = {}> = FunctionComponent<P>;

export interface FeedSubscriber<TItem> {
  (callback: (value: TItem) => void): Disposable;
}

export interface FeedReducer<TData, TAction> {
  (data: TData, item: TAction): Promise<TData> | TData;
}

export interface ComponentClass<P = {}, S = ComponentState> extends StaticLifecycle<P, S> {
  new (props: P, context?: any): Component<P, S>;
  propTypes?: WeakValidationMap<P> | undefined;
  contextType?: Context<any> | undefined;
  contextTypes?: ValidationMap<any> | undefined;
  childContextTypes?: ValidationMap<any> | undefined;
  defaultProps?: Partial<P> | undefined;
  displayName?: string | undefined;
}

export interface FunctionComponent<P = {}> {
  (props: P, context?: any): ReactElement<any, any> | null;
  propTypes?: WeakValidationMap<P> | undefined;
  contextTypes?: ValidationMap<any> | undefined;
  defaultProps?: Partial<P> | undefined;
  displayName?: string | undefined;
}

export type FirstParameter<T extends (arg: any) => any> = T extends (arg: infer P) => any ? P : never;

/**
 * Custom component converters defined outside of piral-core.
 */
export interface PiralCustomComponentConverters<TProps> {}

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

export interface RouteComponentProps<Params extends {
  [K in keyof Params]?: string;
} = {}, C extends StaticContext = StaticContext, S = LocationState> {
  history: History<S>;
  location: Location<S>;
  match: match<Params>;
  staticContext?: C | undefined;
}

export type ReactFragment = Iterable<ReactNode>;

export interface ReactPortal extends ReactElement {
  key: Key | null;
  children: ReactNode;
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

export class Component<P, S> {
  /**
   * If set, `this.context` will be set at runtime to the current value of the given Context.
   * 
   * Usage:
   * 
   * ```ts
   * type MyContext = number
   * const Ctx = React.createContext<MyContext>(0)
   * 
   * class Foo extends React.Component {
   *   static contextType = Ctx
   *   context!: React.ContextType<typeof Ctx>
   *   render () {
   *     return <>My context's value: {this.context}</>;
   *   }
   * }
   * ```
   * @see https://react.dev/reference/react/Component#static-contexttype
   */
  static contextType: Context<any> | undefined;
  /**
   * If using the new style context, re-declare this in your class to be the
   * `React.ContextType` of your `static contextType`.
   * Should be used with type annotation or static contextType.
   * 
   * ```ts
   * static contextType = MyContext
   * // For TS pre-3.7:
   * context!: React.ContextType<typeof MyContext>
   * // For TS 3.7 and above:
   * declare context: React.ContextType<typeof MyContext>
   * ```
   * @see https://react.dev/reference/react/Component#context
   */
  context: unknown;
  constructor(props: Readonly<P> | P);
  constructor(props: P, context: any);
  setState<K extends keyof S>(state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null), callback?: () => void): void;
  forceUpdate(callback?: () => void): void;
  render(): ReactNode;
  readonly props: Readonly<P>;
  state: Readonly<S>;
  /**
   * @deprecated https://legacy.reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs
   */
  refs: {
    [key: string]: ReactInstance;
  };
}

export type StandardMenuType = "general" | "admin" | "user" | "header" | "footer";

export interface PiralCustomMenuTypes {}

export interface PiralCustomModalsMap {}

export type RemainingArgs<T> = T extends (_: any, ...args: infer U) => any ? U : never;

export interface StaticLifecycle<P, S> {
  getDerivedStateFromProps?: GetDerivedStateFromProps<P, S> | undefined;
  getDerivedStateFromError?: GetDerivedStateFromError<P, S> | undefined;
}

export type WeakValidationMap<T> = {
  [K in keyof T]?: null extends T[K] ? Validator<T[K] | null | undefined> : undefined extends T[K] ? Validator<T[K] | null | undefined> : Validator<T[K]>;
};

export interface Context<T> {
  Provider: Provider<T>;
  Consumer: Consumer<T>;
  displayName?: string | undefined;
}

export type ValidationMap<T> = ValidationMap___1<T>;

export type ComponentState = any;

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

export interface History<HistoryLocationState = LocationState> {
  length: number;
  action: Action;
  location: Location<HistoryLocationState>;
  push(location: Path | LocationDescriptor<HistoryLocationState>, state?: HistoryLocationState): void;
  replace(location: Path | LocationDescriptor<HistoryLocationState>, state?: HistoryLocationState): void;
  go(n: number): void;
  goBack(): void;
  goForward(): void;
  block(prompt?: boolean | string | TransitionPromptHook<HistoryLocationState>): UnregisterCallback;
  listen(listener: LocationListener<HistoryLocationState>): UnregisterCallback;
  createHref(location: LocationDescriptorObject<HistoryLocationState>): Href;
}

export interface Location<S = LocationState> {
  pathname: Pathname;
  search: Search;
  state: S;
  hash: Hash;
  key?: LocationKey | undefined;
}

export interface match<Params extends {
  [K in keyof Params]?: string;
} = {}> {
  params: Params;
  isExact: boolean;
  path: string;
  url: string;
}

export interface StaticContext {
  statusCode?: number | undefined;
}

export type LocationState = LocationState___1;

/**
 * The base type for pilet component registration in the global state context.
 */
export interface BaseRegistration {
  /**
   * The pilet registering the component.
   */
  pilet: string;
}

export type WrappedComponent<TProps> = ComponentType<PropsWithChildren<Without<TProps, keyof BaseComponentProps>>>;

export interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {}

export type ReactInstance = Component<any> | Element;

export type GetDerivedStateFromProps<P, S> = /**
 * Returns an update to a component's state based on its new props and old state.
 * 
 * Note: its presence prevents any of the deprecated lifecycle methods from being invoked
 */
(nextProps: Readonly<P>, prevState: S) => Partial<S> | null;

export type GetDerivedStateFromError<P, S> = /**
 * This lifecycle is invoked after an error has been thrown by a descendant component.
 * It receives the error that was thrown as a parameter and should return a value to update state.
 * 
 * Note: its presence prevents any of the deprecated lifecycle methods from being invoked
 */
(error: any) => Partial<S> | null;

export type Validator<T> = Validator___1<T>;

export type Provider<T> = ProviderExoticComponent<ProviderProps<T>>;

export type Consumer<T> = ExoticComponent<ConsumerProps<T>>;

export type ValidationMap___1<T> = {
  [K in keyof T]?: Validator___1<T[K]>;
};

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

export type Action = "PUSH" | "POP" | "REPLACE";

export type Path = Path___1;

export type LocationDescriptor<S = LocationState> = LocationDescriptor___1<S>;

export type TransitionPromptHook<S = LocationState> = TransitionPromptHook___1<S>;

export type UnregisterCallback = () => void;

export type LocationListener<S = LocationState> = LocationListener___1<S>;

export interface LocationDescriptorObject<S = LocationState> {
  pathname?: Pathname | undefined;
  search?: Search | undefined;
  state?: S | undefined;
  hash?: Hash | undefined;
  key?: LocationKey | undefined;
}

export type Href = Href___1;

export type Pathname = Pathname___1;

export type Search = Search___1;

export type Hash = Hash___1;

export type LocationKey = LocationKey___1;

export type LocationState___1 = unknown;

export type PropsWithChildren<P = unknown> = P & {
  children?: ReactNode | undefined;
};

export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export interface ComponentLifecycle<P, S, SS = any> extends NewLifecycle<P, S, SS>, DeprecatedLifecycle<P, S> {
  /**
   * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
   */
  componentDidMount?(): void;
  /**
   * Called to determine whether the change in props and state should trigger a re-render.
   * 
   * `Component` always returns true.
   * `PureComponent` implements a shallow comparison on props and state and returns true if any
   * props or states have changed.
   * 
   * If false is returned, `Component#render`, `componentWillUpdate`
   * and `componentDidUpdate` will not be called.
   */
  shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
  /**
   * Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
   * cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.
   */
  componentWillUnmount?(): void;
  /**
   * Catches exceptions generated in descendant components. Unhandled exceptions will cause
   * the entire component tree to unmount.
   */
  componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
}

export interface Validator___1<T> {
  (props: {
    [key: string]: any;
  }, propName: string, componentName: string, location: string, propFullName: string): Error | null;
  [nominalTypeHack]?: {
    type: T;
  } | undefined;
}

export interface ProviderExoticComponent<P> extends ExoticComponent<P> {
  propTypes?: WeakValidationMap<P> | undefined;
}

export interface ProviderProps<T> {
  value: T;
  children?: ReactNode | undefined;
}

export interface ExoticComponent<P = {}> {
  /**
   * **NOTE**: Exotic components are not callable.
   */
  (props: P): (ReactElement | null);
  readonly $$typeof: symbol;
}

export interface ConsumerProps<T> {
  children(value: T): ReactNode;
}

export interface NavigationBlocker {
  (tx: NavigationTransition): void;
}

export interface NavigationListener {
  (update: NavigationUpdate): void;
}

export type Path___1 = string;

export type LocationDescriptor___1<S = LocationState___1> = Path___1 | LocationDescriptorObject<S>;

export type TransitionPromptHook___1<S = LocationState___1> = (location: Location<S>, action: Action) => string | false | void;

export type LocationListener___1<S = LocationState___1> = (location: Location<S>, action: Action) => void;

export type Href___1 = string;

export type Pathname___1 = string;

export type Search___1 = string;

export type Hash___1 = string;

export type LocationKey___1 = string;

export interface NewLifecycle<P, S, SS> {
  /**
   * Runs before React applies the result of `render` to the document, and
   * returns an object to be given to componentDidUpdate. Useful for saving
   * things such as scroll position before `render` causes changes to it.
   * 
   * Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
   * lifecycle events from running.
   */
  getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
  /**
   * Called immediately after updating occurs. Not called for the initial render.
   * 
   * The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.
   */
  componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
}

export interface DeprecatedLifecycle<P, S> {
  /**
   * Called immediately before mounting occurs, and before `Component#render`.
   * Avoid introducing any side-effects or subscriptions in this method.
   * 
   * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
   * prevents this from being invoked.
   * @deprecated 16.3, use componentDidMount or the constructor instead; will stop working in React 17
   * @see https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
   * @see https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
   */
  componentWillMount?(): void;
  /**
   * Called immediately before mounting occurs, and before `Component#render`.
   * Avoid introducing any side-effects or subscriptions in this method.
   * 
   * This method will not stop working in React 17.
   * 
   * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
   * prevents this from being invoked.
   * @deprecated 16.3, use componentDidMount or the constructor instead
   * @see https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
   * @see https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
   */
  UNSAFE_componentWillMount?(): void;
  /**
   * Called when the component may be receiving new props.
   * React may call this even if props have not changed, so be sure to compare new and existing
   * props if you only want to handle changes.
   * 
   * Calling `Component#setState` generally does not trigger this method.
   * 
   * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
   * prevents this from being invoked.
   * @deprecated 16.3, use static getDerivedStateFromProps instead; will stop working in React 17
   * @see https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
   * @see https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
   */
  componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
  /**
   * Called when the component may be receiving new props.
   * React may call this even if props have not changed, so be sure to compare new and existing
   * props if you only want to handle changes.
   * 
   * Calling `Component#setState` generally does not trigger this method.
   * 
   * This method will not stop working in React 17.
   * 
   * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
   * prevents this from being invoked.
   * @deprecated 16.3, use static getDerivedStateFromProps instead
   * @see https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
   * @see https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
   */
  UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
  /**
   * Called immediately before rendering when new props or state is received. Not called for the initial render.
   * 
   * Note: You cannot call `Component#setState` here.
   * 
   * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
   * prevents this from being invoked.
   * @deprecated 16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17
   * @see https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
   * @see https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
   */
  componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
  /**
   * Called immediately before rendering when new props or state is received. Not called for the initial render.
   * 
   * Note: You cannot call `Component#setState` here.
   * 
   * This method will not stop working in React 17.
   * 
   * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
   * prevents this from being invoked.
   * @deprecated 16.3, use getSnapshotBeforeUpdate instead
   * @see https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
   * @see https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
   */
  UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
}

export interface ErrorInfo {
  /**
   * Captures which component contained the exception, and its ancestors.
   */
  componentStack: string;
}

export const nominalTypeHack: unique symbol;

export interface NavigationTransition extends NavigationUpdate {
  retry?(): void;
}

export interface NavigationUpdate {
  action: NavigationAction;
  location: NavigationLocation;
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