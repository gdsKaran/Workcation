"use server";

import { connectToDatabase } from "@/lib/db";

export async function getEvents() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("events");

    const events = await collection.find({}).toArray();
    return events.map((item) => ({
      ...item,
      _id: item._id.toString(), // Convert ObjectId to string
    }));
  } catch (err) {
    console.error("Error fetching events:", err);
    throw new Error("Unable to fetch events");
  }
}

export async function storeEvent(formData) {
  try {
    if (!formData || typeof formData !== "object") {
      throw new Error("Invalid event data provided");
    }

    const db = await connectToDatabase();
    const collection = db.collection("events");

    const result = await collection.insertOne(formData);

    if (!result.acknowledged) {
      throw new Error("Failed to insert event");
    }

    return result;
  } catch (err) {
    console.error("Error storing event:", err);
    throw new Error(`Unable to store event: ${err.message}`);
  }
}

export async function addEventsDetails(formData) {
  let errors = {};

  if (!formData.description || formData.description.trim().length < 150) {
    errors.description = "Description must be at least 150 characters long!";
  }

  const urlPattern = /^https:\/\/.+/;
  if (!formData.imgUrl || !urlPattern.test(formData.imgUrl.trim())) {
    errors.imgUrl = "Image URL must start with 'https://' and be a valid URL!";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const result = await storeEvent(formData);

  return {
    success: result.acknowledged,
    insertedId: result.insertedId.toString(),
    _id: result.insertedId.toString(),
  };
}
