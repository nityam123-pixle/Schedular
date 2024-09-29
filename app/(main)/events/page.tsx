import { getUserEvents } from "@/actions/events"
import EventCard from "@/components/event-card"
import { Suspense } from "react"

export default function EventPage() {
    return (
        <Suspense fallback={<div>Loading Events</div>}>
            <Events />
        </Suspense>
    )
}

const Events = async () => {
    const { events, username } = await getUserEvents()
    
    if(events.length === 0) {
        return <p>No events found for {username}</p>
    }

    return (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {events.map(event => (
                <EventCard key={event.id} event={event} username={username} />
            ))}
        </div>
    )
}

