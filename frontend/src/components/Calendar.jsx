import DayColumn from './DayColumn'

export default function Calendar({ weekDays, getMealFor, onSlotClick }) {
    return (
        <main className="calendar">
            <div className="calendar__grid">
                {weekDays.map((day) => (
                    <DayColumn
                        key={day.toISOString()}
                        date={day}
                        getMealFor={getMealFor}
                        onSlotClick={onSlotClick}
                    />
                ))}
            </div>
        </main>
    )
}
