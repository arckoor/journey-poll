# DEPRECATION NOTICE
**This project is no longer maintained. Use [flare](https://github.com/arckoor/flare) instead.**

# journey-poll
[Journey](https://thatgamecompany.com/journey/) is a video game made by [ThatGameCompany](https://thatgamecompany.com/).

Players hold a monthly competition to determine the best screenshot taken in that month. <br />
This project was created to give the community a custom environment to host this competition, and is tailored to their specific needs. <br />
The official version is hosted at [poll.journey.arckoor.dev](https://poll.journey.arckoor.dev).

If you want to host this project yourself and don't feel like reverse-engineering the entire backend from the requests this frontend makes, contact me (arckoor) in the Journey Discord.

## Technical stuff
This project uses the Nuxt framework and relies on an external API written in TypeScript using `express`. Accounts designated as `admin` can create, edit and delete polls, as well as publish the results. Users do not need to register to vote. Currently, images are the only valid items to be used as poll options, as such, text prompts are not supported. Additionally, [CDNImg.vue](./components/CDNImg.vue#L52) uses Cloudflare as a CDN to rescale and optimize images.