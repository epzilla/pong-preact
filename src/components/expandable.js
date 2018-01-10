import { Component } from 'preact';

export default class Expandable extends Component {
  constructor(props) {
    super(props);
    this.state = { initialized: false, collapsed: true };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && !this.state.initialized) {
      this.setState({ collapsed: !!nextProps.defaultCollapsed, initialized: true });
    }
  }

  toggle() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
    let collapsed = this.state.initialized ? this.state.collapsed : this.props.defaultCollapsed;
    let classes = collapsed ? 'expandable collapsed' : 'expandable';

    if (this.props.small) {
      classes += ' small';
    }

    if (this.props.centered) {
      classes += ' centered';
    }

    return (
      <div class={classes}>
        <div class="expandable-header">
          <h3><label for={`expandable-${this.props.title}`} >{ this.props.title }</label></h3>
        </div>
        <input class="hidden-checkbox" checked={ !collapsed } type="checkbox" id={`expandable-${this.props.title}`} onChange={() => this.toggle()} />
        <div class="expandable-body">
          { this.props.children }
        </div>
        <label class="toggle-btn-label" for={`expandable-${this.props.title}`} ></label>
      </div>
    );
  }
}