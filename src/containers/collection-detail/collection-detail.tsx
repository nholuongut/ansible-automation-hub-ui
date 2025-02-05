import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { isEqual } from 'lodash';

import {
  CollectionHeader,
  CollectionInfo,
  LoadingPageWithHeader,
  Main,
  AlertList,
  closeAlertMixin,
} from 'src/components';
import { loadCollection, IBaseCollectionState } from './base';
import { ParamHelper } from 'src/utilities/param-helper';
import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

// renders collection level information
class CollectionDetail extends React.Component<
  RouteComponentProps,
  IBaseCollectionState
> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search);

    this.state = {
      collection: undefined,
      params: params,
      alerts: [],
    };
  }

  componentDidMount() {
    this.loadCollection(this.context.selectedRepo, true);
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.location, this.props.location)) {
      this.loadCollection(this.context.selectedRepo);
    }
  }

  render() {
    const { collection, params, alerts } = this.state;

    if (!collection) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const breadcrumbs = [
      namespaceBreadcrumb,
      {
        url: formatPath(Paths.namespaceByRepo, {
          namespace: collection.namespace.name,
          repo: this.context.selectedRepo,
        }),
        name: collection.namespace.name,
      },
      {
        name: collection.name,
      },
    ];

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        <CollectionHeader
          collection={collection}
          params={params}
          updateParams={(p) =>
            this.updateParams(p, () =>
              this.loadCollection(this.context.selectedRepo, true),
            )
          }
          breadcrumbs={breadcrumbs}
          activeTab='install'
          repo={this.context.selectedRepo}
        />
        <Main>
          <section className='body'>
            <CollectionInfo
              {...collection}
              updateParams={(p) => this.updateParams(p)}
              params={this.state.params}
              addAlert={(variant, title, description) =>
                this.setState({
                  alerts: [
                    ...this.state.alerts,
                    {
                      variant,
                      title,
                      description,
                    },
                  ],
                })
              }
            />
          </section>
        </Main>
      </React.Fragment>
    );
  }

  get loadCollection() {
    return loadCollection;
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(CollectionDetail);

CollectionDetail.contextType = AppContext;
