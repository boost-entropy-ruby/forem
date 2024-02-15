import { h, Component } from 'preact';
import PropTypes from 'prop-types';
import { FocusTrap } from '../shared/components/focusTrap';
import { EmailPreferencesForm } from './components/EmailPreferencesForm';
import { FollowTags } from './components/FollowTags';
import { FollowUsers } from './components/FollowUsers';
import { ProfileForm } from './components/ProfileForm';

export class Onboarding extends Component {
  constructor(props) {
    super(props);

    this.recordBillboardConversion();

    const url = new URL(window.location);
    const previousLocation = url.searchParams.get('referrer');

    const slides = [ProfileForm, FollowTags, FollowUsers, EmailPreferencesForm];

    this.nextSlide = this.nextSlide.bind(this);
    this.prevSlide = this.prevSlide.bind(this);
    this.slidesCount = slides.length;

    this.state = {
      currentSlide: 0,
    };

    this.slides = slides.map((SlideComponent, index) => (
      <SlideComponent
        next={this.nextSlide}
        prev={this.prevSlide}
        slidesCount={this.slidesCount}
        currentSlideIndex={index}
        key={index}
        communityConfig={props.communityConfig}
        previousLocation={previousLocation}
      />
    ));
  }

  nextSlide() {
    const { currentSlide } = this.state;
    const nextSlide = currentSlide + 1;
    if (nextSlide < this.slides.length) {
      this.setState({
        currentSlide: nextSlide,
      });
    } else {
      // Redirect to the main feed at the end of onboarding.
      window.location.href = '/';
    }
  }

  prevSlide() {
    const { currentSlide } = this.state;
    const prevSlide = currentSlide - 1;
    if (prevSlide >= 0) {
      this.setState({
        currentSlide: prevSlide,
      });
    }
  }

  recordBillboardConversion() {
    if (!localStorage || !localStorage.getItem('last_interacted_billboard')) {
      return;
    }
    if (localStorage.getItem('last_interacted_billboard')) {
      const tokenMeta = document.querySelector("meta[name='csrf-token']");
      const csrfToken = tokenMeta && tokenMeta.getAttribute('content');
      const dataBody = JSON.parse(
        localStorage.getItem('last_interacted_billboard'),
      );
      dataBody['billboard_event']['category'] = 'signup';
      window.fetch('/billboard_events', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataBody),
        credentials: 'same-origin',
      });
      localStorage.removeItem('last_billboard_click_id');
    }
  }

  // TODO: Update main element id to enable skip link. See issue #1153.
  render() {
    const { currentSlide } = this.state;
    const { communityConfig } = this.props;
    return (
      <main
        className="onboarding-body"
        style={
          communityConfig.communityBackgroundColor &&
          communityConfig.communityBackgroundColor2
            ? {
                background: `linear-gradient(${communityConfig.communityBackgroundColor}, 
                                             ${communityConfig.communityBackgroundColor2})`,
              }
            : { top: 777 }
        }
      >
        <FocusTrap
          key={`onboarding-${currentSlide}`}
          clickOutsideDeactivates="true"
        >
          {this.slides[currentSlide]}
        </FocusTrap>
      </main>
    );
  }
}

Onboarding.propTypes = {
  communityConfig: PropTypes.shape({
    communityName: PropTypes.string.isRequired,
    communityBackgroundColor: PropTypes.string.isRequired,
    communityLogo: PropTypes.string.isRequired,
    communityDescription: PropTypes.string.isRequired,
  }).isRequired,
};
