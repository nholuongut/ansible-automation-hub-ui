import * as React from 'react';
import { Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';

import {
  CertificationDashboard,
  CollectionContent,
  CollectionDetail,
  CollectionDocs,
  CollectionImportLog,
  CollectionDependencies,
  EditNamespace,
  LoginPage,
  MyImports,
  NamespaceDetail,
  MyNamespaces,
  Partners,
  NotFound,
  Search,
  TokenPageStandalone,
  UserList,
  EditUser,
  UserDetail,
  UserCreate,
  UserProfile,
  GroupList,
  GroupDetail,
  RepositoryList,
  ExecutionEnvironmentList,
  ExecutionEnvironmentRegistryList,
  ExecutionEnvironmentDetail,
  ExecutionEnvironmentDetailActivities,
  ExecutionEnvironmentDetailImages,
  ExecutionEnvironmentManifest,
  TaskListView,
  TaskDetail,
} from 'src/containers';
import {
  ActiveUserAPI,
  FeatureFlagsAPI,
  FeatureFlagsType,
  SettingsAPI,
  UserType,
  SettingsType,
} from 'src/api';
import { AppContext } from '../app-context';

import { Paths, formatPath } from 'src/paths';

interface IRoutesProps {
  updateInitialData: (
    data: {
      user?: UserType;
      featureFlags?: FeatureFlagsType;
      settings?: SettingsType;
    },
    callback?: () => void,
  ) => void;
}

interface IAuthHandlerProps extends RouteComponentProps {
  Component: React.ElementType;
  noAuth: boolean;
  updateInitialData: (
    data: {
      user?: UserType;
      featureFlags?: FeatureFlagsType;
      settings?: SettingsType;
    },
    callback?: () => void,
  ) => void;
  isDisabled: boolean;
}
interface IAuthHandlerState {
  isLoading: boolean;
}

interface IRouteConfig {
  comp: React.ElementType;
  path: string;
  noAuth?: boolean;
  isDisabled?: boolean;
}

class AuthHandler extends React.Component<
  IAuthHandlerProps,
  IAuthHandlerState
> {
  static contextType = AppContext;
  constructor(props, context) {
    super(props);
    this.state = { isLoading: !context.user };
  }

  componentDidMount() {
    // This component is mounted on every route change, so it's a good place
    // to check for an active user.
    const { user, settings } = this.context;
    if (!user || !settings) {
      const promises = [];
      promises.push(
        FeatureFlagsAPI.get().then(({ data }) => {
          // we need this even if ActiveUserAPI fails, otherwise isExternalAuth will always be false, breaking keycloak redirect
          this.props.updateInitialData({ featureFlags: data });
        }),
      );
      promises.push(ActiveUserAPI.getUser());
      promises.push(SettingsAPI.get());
      Promise.all(promises)
        .then((results) => {
          this.props.updateInitialData(
            {
              user: results[1],
              settings: results[2].data,
            },
            () => this.setState({ isLoading: false }),
          );
        })
        .catch(() => this.setState({ isLoading: false }));
    }
  }

  render() {
    const { isLoading } = this.state;
    const { Component, noAuth, ...props } = this.props;
    const { user, featureFlags } = this.context;

    let isExternalAuth = false;
    if (featureFlags) {
      isExternalAuth = featureFlags.external_authentication;
    }

    if (isLoading) {
      return null;
    }

    if (!user && !noAuth) {
      // NOTE: also update LoginLink when changing this
      if (isExternalAuth && UI_EXTERNAL_LOGIN_URI) {
        window.location.replace(UI_EXTERNAL_LOGIN_URI);
        return <div></div>;
      }
      return (
        <Redirect
          push
          to={formatPath(Paths.login, {}, { next: props.location.pathname })}
        ></Redirect>
      );
    }

    // only enforce this if feature flags are set. Otherwise the container
    // registry will always return a 404 on the first load.
    if (this.props.isDisabled) {
      return <Redirect push to={Paths.notFound}></Redirect>;
    }

    return <Component {...props}></Component>;
  }
}

export class Routes extends React.Component<IRoutesProps> {
  static contextType = AppContext;

  // Note: must be ordered from most specific to least specific
  getRoutes(): IRouteConfig[] {
    const { featureFlags } = this.context;
    let isContainerDisabled = true;
    let isUserMgmtDisabled = false;
    if (featureFlags) {
      isContainerDisabled = !featureFlags.execution_environments;
      isUserMgmtDisabled = featureFlags.external_authentication;
    }
    return [
      {
        comp: ExecutionEnvironmentDetailActivities,
        path: Paths.executionEnvironmentDetailActivities,
        isDisabled: isContainerDisabled,
      },
      {
        comp: ExecutionEnvironmentManifest,
        path: Paths.executionEnvironmentManifest,
        isDisabled: isContainerDisabled,
      },
      {
        comp: ExecutionEnvironmentDetailImages,
        path: Paths.executionEnvironmentDetailImages,
        isDisabled: isContainerDisabled,
      },
      {
        comp: ExecutionEnvironmentDetail,
        path: Paths.executionEnvironmentDetail,
        isDisabled: isContainerDisabled,
      },
      {
        comp: ExecutionEnvironmentList,
        path: Paths.executionEnvironments,
        isDisabled: isContainerDisabled,
      },
      {
        comp: ExecutionEnvironmentRegistryList,
        path: Paths.executionEnvironmentsRegistries,
        isDisabled: isContainerDisabled,
      },
      {
        comp: TaskListView,
        path: Paths.taskList,
      },
      { comp: GroupList, path: Paths.groupList },
      { comp: GroupDetail, path: Paths.groupDetail },
      { comp: TaskDetail, path: Paths.taskDetail },
      { comp: RepositoryList, path: Paths.repositories },
      { comp: UserProfile, path: Paths.userProfileSettings },
      {
        comp: UserCreate,
        path: Paths.createUser,
        isDisabled: isUserMgmtDisabled,
      },
      { comp: EditUser, path: Paths.editUser, isDisabled: isUserMgmtDisabled },
      { comp: UserDetail, path: Paths.userDetail },
      { comp: UserList, path: Paths.userList },
      { comp: CertificationDashboard, path: Paths.approvalDashboard },
      { comp: NotFound, path: Paths.notFound },
      { comp: TokenPageStandalone, path: Paths.token },
      { comp: Partners, path: Paths[NAMESPACE_TERM] },
      { comp: EditNamespace, path: Paths.editNamespace },
      { comp: NamespaceDetail, path: Paths.myCollections },
      { comp: NamespaceDetail, path: Paths.myCollectionsByRepo },
      { comp: MyNamespaces, path: Paths.myNamespaces },
      { comp: LoginPage, path: Paths.login, noAuth: true },
      { comp: CollectionDocs, path: Paths.collectionDocsPageByRepo },
      { comp: CollectionDocs, path: Paths.collectionDocsIndexByRepo },
      { comp: CollectionDocs, path: Paths.collectionContentDocsByRepo },
      { comp: CollectionContent, path: Paths.collectionContentListByRepo },
      { comp: CollectionImportLog, path: Paths.collectionImportLogByRepo },
      {
        comp: CollectionDependencies,
        path: Paths.collectionDependenciesByRepo,
      },
      { comp: CollectionDetail, path: Paths.collectionByRepo },
      { comp: NamespaceDetail, path: Paths.namespaceByRepo },
      { comp: Search, path: Paths.searchByRepo },
      { comp: CollectionDocs, path: Paths.collectionDocsPage },
      { comp: CollectionDocs, path: Paths.collectionDocsIndex },
      { comp: CollectionDocs, path: Paths.collectionContentDocs },
      { comp: CollectionContent, path: Paths.collectionContentList },
      { comp: CollectionImportLog, path: Paths.collectionImportLog },
      { comp: MyImports, path: Paths.myImports },
      { comp: CollectionDetail, path: Paths.collection },
      { comp: NamespaceDetail, path: Paths.namespace },
      { comp: Search, path: Paths.search },
    ];
  }

  render() {
    return (
      <Switch>
        {this.getRoutes().map((route, index) => (
          <Route
            key={index}
            render={(props) => (
              <AuthHandler
                updateInitialData={this.props.updateInitialData}
                noAuth={route.noAuth}
                Component={route.comp}
                isDisabled={route.isDisabled}
                {...props}
              ></AuthHandler>
            )}
            path={route.path}
          ></Route>
        ))}
      </Switch>
    );
  }
}
