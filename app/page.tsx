import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { Event } from "@/database";

const page = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`);
  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }
  const { events } = await res?.json();

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Mustn't Miss
      </h1>
      <p className="text-center">
        Hackatons, Meetups, and Conferences, All in One Place
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-7" id="events">
        <h3>Featured Events</h3>

        <ul className="events list-none">
          {events && events?.length > 0 && events.map((event: Event) => (
            <li key={event.title}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default page;
