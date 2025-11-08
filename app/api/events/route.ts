import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Event } from "@/database";
import {v2 as cloudinary} from "cloudinary"

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const contentType = req.headers.get("content-type") || "";
    let eventData: Record<string, unknown>;

    if (contentType.includes("application/json")) {
      try {
        eventData = await req.json();
      } catch (error) {
        return NextResponse.json(
          { message: "Invalid JSON data" },
          { status: 400 }
        );
      }
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      try {
        const formData = await req.formData();
        eventData = {};

        const file = formData.get("image") as File;
        if(!file){
            return NextResponse.json(
                { message: "Image file is required" },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({resource_type: "image", folder: "DevEvent"}, (error, result) => {
                if(error){
                    reject(error)
                }else{
                    resolve(result)
                }
            }).end(buffer)
        })

        for (const [key, value] of formData.entries()) {
          const strValue = String(value);
          if (
            (strValue.startsWith("[") && strValue.endsWith("]")) ||
            (strValue.startsWith("{") && strValue.endsWith("}"))
          ) {
            try {
              eventData[key] = JSON.parse(strValue);
            } catch {
              eventData[key] = strValue;
            }
          } else {
            eventData[key] = strValue;
          }
        }

        eventData.image = (uploadResult as {secure_url: string}).secure_url
      } catch (error) {
        return NextResponse.json(
          {
            message: `Invalid form data: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Unsupported Media Type" },
        { status: 415 }
      );
    }

    const createdEvent = await Event.create(eventData);

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Event creation Error",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
