import { h, Component } from 'preact';
import Rest from '../lib/rest-service';
import { route } from 'preact-router';
import { Link } from 'preact-router/match';
import Avatar from '../components/avatar';
import LocalStorageService from '../lib/local-storage-service';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    if (!props || !props.user) {
      route(`/`);
    }
    else {
      this.state = { user: this.props.user };
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user) {
      this.setState({ user: nextProps.user });
    }
  }

  setValue = (e) => {
    let obj = {};
    obj[e.target.name] = e.target.value;
    this.setState(obj);
  };

  submit = (e) => {
    e.preventDefault();
    Rest.put('users', this.state).then(user => {
      LocalStorageService.set('user', user);
      this.setState({
        oldpassword: null,
        password: null,
        password2: null
      });
    }).catch(err => {
      this.setState({ error: err });
    });
  };

  render() {
    return (
      <div class="main user-profile">
        <div class="user-header-row">
          <Avatar avatar={this.state.user.avatar} {...this.props} big editable />
          <h1>{this.state.user.name}</h1>
        </div>
        <form name="form" onSubmit={(e) => this.submit(e)}>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" autofocus="autofocus" class="form-control" onChange={this.setValue} value={this.state.user.email} />
          </div>
          <div class="form-group">
            <label>Old Password</label>
            <input type="password" name="oldpassword" class="form-control" onChange={this.setValue} value={this.state.oldpassword} />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" name="password" class="form-control" onChange={this.setValue} value={this.state.password} />
          </div>
          <div class="form-group">
            <label>Re-type New Password</label>
            <input type="password" name="password2" class="form-control" onChange={this.setValue} value={this.state.password2} />
          </div>          <button type="submit" class="btn primary"> Update </button>
        </form>
      </div>
    );
  }
}
