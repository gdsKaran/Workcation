import { getEvents } from "@/action/events";
import DiffEvents from "@/components/events";
import Header from "@/components/header";

export default async function Events() {
  let events = [];

  try {
    const fetchedEvents = await getEvents();
    if (fetchedEvents && Array.isArray(fetchedEvents)) {
      events = fetchedEvents;
    }
  } catch (error) {
    console.error("Error fetching events:", error);
  }

  return (
    <>
      <Header />
      <DiffEvents events={events} />
    </>
  );
}
