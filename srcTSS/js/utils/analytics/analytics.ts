// function addAnalytics(analytics_ids) {
//   analytics_ids.forEach((id) => {
//     $.getScript(
//       `https://www.googletagmanager.com/gtag/js?id=${id}`,
//       function (data, textStatus, jqxhr) {
//         window.dataLayer = window.dataLayer || [];
//         function gtag() {
//           dataLayer.push(arguments);
//         }
//         gtag("js", new Date());
//         gtag("config", id);
//       }
//     );
//   });
// }

import { Analytics } from "analytics";
import googleAnalyticsPlugin from "@analytics/google-analytics";

const analytics = Analytics({
  app: "IDE Crespo",
  version: "1.0.0",
  plugins: [googleAnalyticsPlugin({trackingId: "SO-WEIRD4DIS"})],
});

analytics.page();

// analytics.track("",{
// })

// analytics.identify(
//   '',{}
// );
