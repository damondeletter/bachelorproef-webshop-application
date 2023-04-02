import * as React from 'react';
import { ComponentsState, ErrorComponentsState, Menu, Notifications, SwitchErrorInfo, MenuItemProps, ExtensionSlot } from 'piral';
import { Link } from 'react-router-dom';
import "./layout.css";

const MenuItem: React.FC<MenuItemProps> = ({ children }) => <li className="nav-item">{children}</li>;

export const errors: Partial<ErrorComponentsState> = {
  not_found: () => (
    <div className='notfound'>
      <img src="https://static.vecteezy.com/system/resources/previews/003/309/116/non_2x/ghost-character-illustration-holding-a-stop-sign-free-vector.jpg"/>
      <p>De pagina die u wenst te bezoeken is niet beschikbaar. Bent u zeker dat deze pagina bestaat?</p>
      <p>
        <Link to="/" className="center-btn btn btn-default">Keer terug naar nomadr-webshop</Link>.
      </p>
    </div>
  ),
};

export const layout: Partial<ComponentsState> = {
  ErrorInfo: props => (
    <div className="notfound">
      <h1>Oepsie..</h1>
      <SwitchErrorInfo {...props} />
      <p>Er is iets foutgelopen...</p>
      <p>
        <Link to="/" className="center-btn btn btn-default">Keer terug naar nomadr-webshop</Link>.
      </p>
    </div>
  ),
  DashboardContainer: ({ children }) => (
    <div className="main-container -app-shell">
        {children}
    </div>
  ),
  Layout: ({ children }) => (
    <div>
      <Notifications />
      <Menu type="general" />
      <div className="container">{children}</div>
      {/* <ExtensionSlot name="layout-footer" params={params}/> */}
    </div>
  ),
  MenuContainer: ({ children }) => {
    const [collapsed, setCollapsed] = React.useState(true);
    return (
      <header className="-app-shell">
        <nav className="navbar navbar-light navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3">
          <div className="container">
            <Link className="navbar-brand" to="/">
              Nomadr-webshop
            </Link>
            <button
              aria-label="Toggle navigation"
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="navbar-toggler mr-2">
              <span className="navbar-toggler-icon" />
            </button>
            <div
              className={`collapse navbar-collapse d-sm-inline-flex flex-sm-row-reverse ${collapsed ? '' : 'show'}`}
              aria-expanded={!collapsed}>
              <ul className="navbar-nav flex-grow">
                <Link to="/cart">Cart{}</Link>
                {children}
              </ul>
            </div>
          </div>
        </nav>
      </header>
    );
  },
  MenuItem,
};