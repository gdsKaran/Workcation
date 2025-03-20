"use client";

import React, { useOptimistic, useTransition } from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import EventPanel from "./createEventPanel";
import { addEventsDetails } from "@/action/events";

export default function DiffEvents({ events: initialEvents = [] }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [textAnimState, setTextAnimState] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");
  const [events, setEvents] = useState(initialEvents);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [eventState, setEventState] = useState(false);
  const [isPending, startTranscation] = useTransition();
  const [optimisticEvents, setOptimisticEvents] = useOptimistic(
    events,
    (currentEvents, newEvents) => {
      return [...currentEvents, newEvents];
    }
  );

  async function handleOptimistic(newEventData) {
    const tempId = `temp-${Math.random().toString(36).substring(2, 15)}`;
    const optimisiticEvent = {
      ...newEventData,
      _id: tempId,
    };

    startTranscation(() => {
      setOptimisticEvents(optimisiticEvent);
    });

    setEventState(false);

    try {
      const result = await addEventsDetails(newEventData);

      if (!result.success || result.errors) {
        setErrors(result.errors || { general: "Unknown error occurred" });
        return;
      }

      const newEvent = {
        ...newEventData,
        _id: result._id
          ? typeof result._id === "string"
            ? result._id
            : result._id.toString()
          : `error-${Date.now()}`,
      };

      setEvents((currentEvents) => [
        ...currentEvents.filter((event) => event._id !== tempId),
        newEvent,
      ]);
    } catch (error) {
      console.error("Error submitting event:", error);
      alert("Failed to add event. Please try again.");

      //remove optimistic update incase of error
      setEvents((currentEvents) =>
        currentEvents.filter((event) => event._id !== tempId)
      );
    }
  }

  // Calculate category counts
  const getCategoryCounts = () => {
    const counts = {
      all: events.length,
      religious: events.filter(
        (event) => event.category?.toLowerCase() === "religious"
      ).length,
      social: events.filter(
        (event) => event.category?.toLowerCase() === "social"
      ).length,
      charity: events.filter(
        (event) => event.category?.toLowerCase() === "charity"
      ).length,
    };
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  useEffect(() => {
    setIsLoaded(true);

    // Initialize all text elements as invisible
    const initialAnimState = {};
    events.forEach((post) => {
      const postId = post._id;
      initialAnimState[`title-${postId}`] = false;
      initialAnimState[`desc-${postId}`] = false;
    });
    setTextAnimState(initialAnimState);

    // Set up staggered animations for text elements with appropriate delay
    const animationTimeout = setTimeout(() => {
      events.forEach((post, index) => {
        // Add delay based on card index
        const baseDelay = 1200 + index * 300;

        // Animate title
        setTimeout(() => {
          setTextAnimState((prev) => ({
            ...prev,
            [`title-${post._id}`]: true,
          }));

          // Animate description after title
          setTimeout(() => {
            setTextAnimState((prev) => ({
              ...prev,
              [`desc-${post._id}`]: true,
            }));
          }, 500); // Delay between title and description animations
        }, baseDelay);
      });
    }, 1000);

    return () => clearTimeout(animationTimeout);
  }, [events]);

  // Filter events based on selected category
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(
        events.filter((event) => event.category?.toLowerCase() === activeFilter)
      );
    }
  }, [activeFilter, events]);

  // Handler for filter button clicks
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  function EventPanelHandler() {
    setEventState(true);
  }

  function closeHandler() {
    setEventState(false);
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <EventPanel
        onState={eventState}
        closeState={closeHandler}
        onCreateEvent={handleOptimistic}
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-1000 ease-out ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-balance text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl relative overflow-hidden">
            <span className="inline-block overflow-hidden">
              <span
                className={`inline-block transition-transform duration-1000 ${
                  isLoaded ? "translate-y-0" : "translate-y-full"
                }`}
              >
                Upcoming
              </span>
            </span>
            &nbsp;
            <span className="inline-block overflow-hidden">
              <span
                className={`inline-block transition-transform duration-1000 delay-300 ${
                  isLoaded ? "translate-y-0" : "translate-y-full"
                }`}
              >
                Events
              </span>
            </span>
          </h2>
          <p
            className={`mt-4 text-xl font-medium text-gray-600 transition-all duration-1000 delay-500 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            We Helped Communities Connect & Flourish.
          </p>

          {/* Filter buttons */}
          <div
            className={`mt-8 flex justify-center gap-3 transition-all duration-1000 delay-700 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <button
              onClick={() => handleFilterClick("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                activeFilter === "all"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              All
              <span className="absolute -top-2 -right-2 bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {categoryCounts.all}
              </span>
            </button>

            <button
              onClick={() => handleFilterClick("religious")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                activeFilter === "religious"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Religious
              <span className="absolute -top-2 -right-2 bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {categoryCounts.religious}
              </span>
            </button>

            <button
              onClick={() => handleFilterClick("social")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                activeFilter === "social"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Social
              <span className="absolute -top-2 -right-2 bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {categoryCounts.social}
              </span>
            </button>

            <button
              onClick={() => handleFilterClick("charity")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                activeFilter === "charity"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Charity
              <span className="absolute -top-2 -right-2 bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {categoryCounts.charity}
              </span>
            </button>

            <button
              onClick={() => EventPanelHandler()}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                activeFilter === "all"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Create One
              <span className="absolute -top-2 -right-2 bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                +
              </span>
            </button>
          </div>

          {/* Filtered events count */}
          <p
            className={`mt-4 text-sm text-gray-500 transition-all duration-700 delay-800 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            Showing {filteredEvents.length}{" "}
            {activeFilter !== "all" ? activeFilter : ""} events
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {filteredEvents.map((post, index) => (
            <article
              key={post._id}
              className={`event-card flex flex-col items-start justify-between rounded-xl shadow-lg hover:shadow-xl transition-all duration-700 ease-out ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-16"
              }`}
              style={{
                transitionDelay: `${index * 200}ms`,
                height: "600px", // Fixed height for desktop
              }}
            >
              <div
                className="relative w-full overflow-hidden rounded-t-xl"
                style={{ height: "220px" }}
              >
                <Image
                  priority
                  width={0}
                  height={0}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  alt=""
                  src={post.imgUrl}
                  className={`w-full h-full object-cover transition-all duration-1000 ${
                    isLoaded ? "scale-100 blur-0" : "scale-110 blur-sm"
                  } hover:scale-110 hover:brightness-110`}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                />
                <div className="absolute inset-0 rounded-t-xl ring-1 ring-inset ring-gray-900/10" />
              </div>
              <div
                className="p-6 max-w-xl w-full flex flex-col h-full"
                style={{ height: "380px" }}
              >
                {/* Header section with date and category */}
                <div
                  className={`flex items-center gap-x-4 text-sm transition-all duration-700 delay-100 ${
                    isLoaded
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  }`}
                >
                  <time
                    dateTime={post.dateTime}
                    className="text-gray-500 font-medium"
                  >
                    <span className="relative overflow-hidden">
                      <span
                        className={`inline-block transition-all duration-500 ${
                          isLoaded
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-2"
                        }`}
                        style={{
                          transitionDelay: `${800 + index * 100}ms`,
                          background:
                            "linear-gradient(to right, transparent, rgba(79, 70, 229, 0.1) 20%, rgba(79, 70, 229, 0.1) 80%, transparent)",
                          padding: "0 6px",
                          borderLeft: "2px solid #4f46e5",
                          fontStyle: "italic",
                          fontSize: "0.9rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        On {post.date}
                      </span>
                    </span>
                  </time>
                  <a
                    href=""
                    className={`relative z-10 rounded-full bg-indigo-50 px-3 py-1.5 font-medium text-indigo-600 hover:bg-indigo-100 transition-all duration-500 ${
                      isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                    style={{ transitionDelay: `${1000 + index * 100}ms` }}
                  >
                    {post.category}
                  </a>
                </div>

                {/* Main content with flex-grow and overflow handling */}
                <div className="group relative mt-4 flex-grow overflow-hidden flex flex-col">
                  {/* Title with slide-up animation */}
                  <div className="overflow-hidden">
                    <h3
                      className={`text-2xl font-bold transition-all duration-800 ease-out ${
                        textAnimState[`title-${post._id}`]
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-12"
                      }`}
                    >
                      <a
                        href={""}
                        className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-900 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-1000 cursor-pointer"
                      >
                        <span className="absolute inset-0" />
                        {post.title}
                      </a>
                    </h3>
                  </div>

                  {/* Description with overflow handling */}
                  <div
                    className="mt-4 overflow-y-auto flex-grow"
                    style={{ maxHeight: "180px" }}
                  >
                    <p
                      className={`text-base leading-relaxed text-gray-600 transition-all duration-800 ease-out ${
                        textAnimState[`desc-${post._id}`]
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-16"
                      }`}
                    >
                      {post.description}
                    </p>
                  </div>
                </div>

                {/* Footer section with location - always at bottom */}
                <div
                  className={`relative mt-2 flex items-center gap-x-3 transition-all duration-700 ${
                    isLoaded
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${1200 + index * 100}ms` }}
                >
                  <div className="overflow-hidden">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`size-5 text-gray-400 transition-all duration-1000 ${
                        isLoaded ? "scale-100" : "scale-0"
                      }`}
                      style={{ transitionDelay: `${1400 + index * 50}ms` }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p
                      className={`font-normal text-gray-800 transition-all duration-500 ${
                        isLoaded
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 translate-x-4"
                      }`}
                      style={{ transitionDelay: `${1600 + index * 50}ms` }}
                    >
                      <a href={""}>
                        <span className="absolute inset-0" />
                        {post.city}
                      </a>
                    </p>
                    <p
                      className={`text-gray-500 text-xs tracking-wide transition-all duration-500 ${
                        isLoaded
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 translate-x-4"
                      }`}
                      style={{ transitionDelay: `${1700 + index * 50}ms` }}
                    >
                      {post.country}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Show empty state when no events match the filter */}
        {filteredEvents.length === 0 && (
          <div
            className={`text-center py-16 transition-all duration-700 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No {activeFilter} events found
            </h3>
            <p className="mt-1 text-gray-500">
              There are currently no events in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
