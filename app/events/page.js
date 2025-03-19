import { getEvents } from "@/action/events";
import DiffEvents from "@/components/events";
import Header from "@/components/header";

export default async function Events() {
  const events = await getEvents();

  return (
    <>
      <Header />
      <DiffEvents events={events} />
    </>
  );
}
