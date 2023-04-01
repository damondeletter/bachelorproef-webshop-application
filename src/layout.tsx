import * as React from 'react';
import { ComponentsState, ErrorComponentsState, Menu, Notifications, SwitchErrorInfo, MenuItemProps } from 'piral';
import { Link } from 'react-router-dom';

const MenuItem: React.FC<MenuItemProps> = ({ children }) => <li className="nav-item">{children}</li>;

export const errors: Partial<ErrorComponentsState> = {
  not_found: () => (
    <div>
      <p className="error">De pagina die u wenst te bezoeken is niet beschikbaar. Bent u zeker dat deze pagina bestaat?</p>
      <p>
        Keer terug <Link to="/">naar nomadr-webshop</Link>.
      </p>
    </div>
  ),
};

export const layout: Partial<ComponentsState> = {
  ErrorInfo: props => (
    <div>
      <h1>Error</h1>
      <SwitchErrorInfo {...props} />
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