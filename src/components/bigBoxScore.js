import { Component } from 'preact';
import GoalBox from './GoalBox';

export default class BigBoxScore extends Component {
  constructor(props) {
    super(props);
  }

  isLight = (hexCode) => {
    hexCode = hexCode.substring(1); // strip #
    let rgb = parseInt(hexCode, 16); // convert rrggbb to decimal
    let r = (rgb >> 16) & 0xff; // extract red
    let g = (rgb >> 8) & 0xff; // extract green
    let b = (rgb >> 0) & 0xff; // extract blue

    let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    return (luma > 230);
  };

  render() {
    const game = this.props.game;
    const played = this.props.played;

    if (!game.team1.bgColor) {
      game.team1.code = 'default';
      game.team1.bgColor = '#EFEFEF';
      game.team1.textColor = '#555';
    }

    if (!game.team2.bgColor) {
      game.team2.code = 'default';
      game.team2.bgColor = '#EFEFEF';
      game.team2.textColor = '#555';
    }

    const team1LightBg = this.isLight(game.team1.bgColor);
    const team2LightBg = this.isLight(game.team2.bgColor);

    return (
      <div class="big-box-score">
        <button class={`back-button ${team1LightBg ? 'dark' : ''}`} onClick={() => this.props.hide()}>
          <i class="fa fa-times"></i>
        </button>
        <span class="date-span">{ game.playAt }</span>
        <div class="team-block">
          <div class="team-bg" style={`background-color: ${ game.team1.bgColor }`}></div>
          <div class="team-img" style={`background-image: url(/assets/badges/${ game.team1.code }.svg)`}></div>
          <div class="overlay">
            <span
              style={`color: ${ team1LightBg ? game.team1.textColor : 'white' }`}
              class={`team-name team-name-full ${ team1LightBg ? 'light' : ''}`}
            >{ game.team1.title }</span>
            <span
              style={`color: ${ team1LightBg ? game.team1.textColor : 'white' }`}
              class={`team-name team-name-small ${ team1LightBg ? 'light' : ''}`}
            >{ game.team1.shortName }</span>
            <span
              style={`color: ${ team1LightBg ? game.team1.textColor : 'white' }`}
              class={`team-name team-name-smaller ${game.team1.title.length > 8 ? 'small-text' : ''} ${ team1LightBg ? 'light' : ''}`}
            >{ game.team1.shorterName }</span>
            <span
              style={`color: ${ team1LightBg ? game.team1.textColor : 'white' }`}
              class={`team-name team-name-smallest ${ team1LightBg ? 'light' : ''}`}
            >{ game.team1.code }</span>
            { played ?
              <span
                style={`color: ${ team1LightBg ? game.team1.textColor : 'white' }`}
                class="score-line score-line-1">{ game.score1 }
              </span>
              : null }
            { game.score1 > 0 ? <GoalBox goals={game.goals} team={game.team1Id} textColor={team1LightBg ? game.team1.textColor : null} /> : null }
          </div>
        </div>
        <div class="separator-left" style={`border-color: ${ game.team1.bgColor } transparent transparent transparent;`}></div>
        <div class="separator-right" style={`border-color: transparent transparent ${ game.team2.bgColor } transparent;`}></div>
        <div class="team-block">
          <div class="team-bg" style={`background-color: ${ game.team2.bgColor }`}></div>
          <div class="team-img" style={`background-image: url(/assets/badges/${ game.team2.code }.svg)`}></div>
          <div class="overlay">
            <span
              style={`color: ${ team2LightBg ? game.team2.textColor : 'white' }`}
              class={`team-name team-name-full ${ team2LightBg ? 'light' : ''}`}
            >{ game.team2.title }</span>
            <span
              style={`color: ${ team2LightBg ? game.team2.textColor : 'white' }`}
              class={`team-name team-name-small ${ team2LightBg ? 'light' : ''}`}
            >{ game.team2.shortName }</span>
            <span
              style={`color: ${ team2LightBg ? game.team2.textColor : 'white' }`}
              class={`team-name team-name-smaller ${game.team2.title.length > 8 ? 'small-text' : ''} ${ team2LightBg ? 'light' : ''}`}
            >{ game.team2.shorterName }</span>
            <span
              style={`color: ${ team2LightBg ? game.team2.textColor : 'white' }`}
              class={`team-name team-name-smallest ${ team2LightBg ? 'light' : ''}`}
            >{ game.team2.code }</span>
            { played ?
              <span
                style={`color: ${ team2LightBg ? game.team2.textColor : 'white' }`}
                class="score-line score-line-1">{ game.score2 }
              </span>
              : null }
            { game.score2 > 0 ? <GoalBox goals={game.goals} team={game.team2Id} textColor={team2LightBg ? game.team2.textColor : null} /> : null }
          </div>
        </div>
      </div>
    );
  }
}