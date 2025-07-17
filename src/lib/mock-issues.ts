// This file now interacts with json-server for persistent storage of submitted issues.

import type { SubmittedIssue } from "@/types/chat"

const JSON_SERVER_URL = "http://localhost:5000/submittedIssues"

export const getSubmittedIssues = async (): Promise<SubmittedIssue[]> => {
  try {
    const response = await fetch(JSON_SERVER_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: SubmittedIssue[] = await response.json()
    // Ensure timestamps are Date objects
    return data.map((issue) => ({
      ...issue,
      timestamp: new Date(issue.timestamp),
    }))
  } catch (error) {
    console.error("Failed to fetch submitted issues from json-server, returning empty array:", error)
    return [] // Return empty array on error
  }
}

export const addSubmittedIssue = async (
  issue: Omit<SubmittedIssue, "id" | "timestamp" | "status">,
): Promise<SubmittedIssue | undefined> => {
  const newIssue: Omit<SubmittedIssue, "id"> = {
    timestamp: new Date(),
    status: "pending",
    ...issue,
  }
  try {
    const response = await fetch(JSON_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newIssue),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const createdIssue: SubmittedIssue = await response.json()
    return { ...createdIssue, timestamp: new Date(createdIssue.timestamp) }
  } catch (error) {
    console.error("Failed to add submitted issue to json-server:", error)
    return undefined
  }
}

export const updateIssueStatus = async (
  id: string,
  status: "pending" | "resolved",
): Promise<SubmittedIssue | undefined> => {
  try {
    // First, get the existing issue to ensure we don't overwrite other fields
    const getResponse = await fetch(`${JSON_SERVER_URL}/${id}`)
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch issue for update! status: ${getResponse.status}`)
    }
    const existingIssue: SubmittedIssue = await getResponse.json()

    const updatedIssue = { ...existingIssue, status }

    const response = await fetch(`${JSON_SERVER_URL}/${id}`, {
      method: "PUT", // Use PUT to replace the resource
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedIssue),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result: SubmittedIssue = await response.json()
    return { ...result, timestamp: new Date(result.timestamp) }
  } catch (error) {
    console.error(`Failed to update issue status for ID ${id}:`, error)
    return undefined
  }
}
