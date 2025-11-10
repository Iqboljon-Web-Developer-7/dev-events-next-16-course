import { notFound } from "next/navigation";

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const event = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${slug}`
  );
  if (!event.ok) {
    throw new Error("Failed to fetch event");
  }
  const {
    event: {
      description,
      image,
      overview,
      date,
      time,
      location,
      mode,
      agenda,
      audience,
      tags,
    },
  } = await event?.json();

  console.log(
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    audience,
    tags
  );

  if (!description) return notFound();

  return (
    <section id="event">
      <h1>Event Description</h1>
      <p className="mt-2">{description}</p>
    </section>
  );
};

export default EventDetailsPage;
