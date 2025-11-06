type EventItem = {
    image: string;
    title: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}

export const events:EventItem[] = [
  {
    image: "/images/event1.png",
    title: "Global AI Summit 2024",
    slug: "global-ai-summit-2024",
    location: "Moscone Center, San Francisco, CA",
    date: "2024-09-12",
    time: "09:00",
  },
  {
    image: "/images/event2.png",
    title: "React Conf Europe",
    slug: "react-conf-europe-2024",
    location: "RAI Amsterdam, Netherlands",
    date: "2024-10-05",
    time: "10:00",
  },
  {
    image: "/images/event3.png",
    title: "Open Source Hackathon Weekend",
    slug: "oss-hackathon-2024",
    location: "GitHub HQ, San Francisco, CA",
    date: "2024-07-30",
    time: "14:00",
  },
  {
    image: "/images/event4.png",
    title: "Tech Career Fair & Networking Night",
    slug: "tech-career-fair-2024",
    location: "Austin Convention Center, Austin, TX",
    date: "2024-10-05",
    time: "17:30",
  },
  {
    image: "/images/event5.png",
    title: "Web3 Developers Meetup",
    slug: "web3-dev-meetup-2024",
    location: "WeWork Shibuya, Tokyo, Japan",
    date: "2024-08-20",
    time: "19:00",
  },
  {
    image: "/images/event6.png",
    title: "DevOps Days London",
    slug: "devops-days-london-2024",
    location: "QEII Centre, Westminster, London, UK",
    date: "2024-11-15",
    time: "08:30",
  },
];
