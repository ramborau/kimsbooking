Doctor Appointment Booking UI
Project Overview
Create a mobile-first doctor appointment booking interface using React and ShadCN with sticky headers/footers for a native app-like experience.
Tech Stack

React + TypeScript
ShadCN UI Components
Tailwind CSS
Lucide Icons (stroke-width: 1.25)
Font: Inter
Primary Color: #c71d22

UI Flow Steps
Step 1: Select Department

Display departments in a clean grid/list
Sticky header with title "Select Department"
Sticky footer with "Continue" button

Step 2: Select Location

Show available locations after department selection
Maintain sticky header with back button
Footer button: "Select Location"

Step 3: Choose Appointment Date

Show next 7 days as scrollable date cards
Add calendar icon for date picker
Display next 5 days as quick select options below calendar
Footer button: "Confirm Date"

Step 4: Select Doctor

Display doctor cards in grid layout
Each card contains:

Small doctor image
Doctor name
Degree (e.g., MBBS, MD)
Experience (e.g., "10+ years")

Footer button: "Select Doctor"

Step 5: Select Time Slot

Filter tabs: Morning | Afternoon | Evening
Horizontal scrollable time slots
Visual indication for available/unavailable slots
Footer button: "Confirm Time"

Step 6: Enter Patient Details

Form fields:

First Name
Last Name
Email Address
Mobile Number

Form validation
Footer button: "Book Appointment"

Step 7: Booking Confirmation

Display booking summary
Show booking reference number
Include all appointment details
Footer button: "Done"

Component Structure
/components
/layout - StickyHeader.tsx (collapsible on scroll) - StickyFooter.tsx (persistent action button)
/booking - DepartmentSelect.tsx - LocationSelect.tsx - DatePicker.tsx - DoctorGrid.tsx - TimeSlotPicker.tsx - PatientForm.tsx - BookingConfirmation.tsx
Key Design Requirements
Sticky Header

Contains: Back button | Page title | Step indicator
Collapses to slim bar on scroll
Smooth transition animation

Sticky Footer

Single primary action button
Always visible at bottom
Disabled state when form incomplete

Mobile-First Approach

Touch-friendly tap targets (min 44x44px)
Swipeable components where applicable
Optimized for viewport 375px - 428px
No horizontal scrolling (except time slots)

Visual Design

Use shadows for depth
Rounded corners for modern look
Subtle animations for interactions
Loading states for async operations

Implementation Notes
State Management

Use React Context or Zustand for booking flow state
Persist form data between steps
Clear state on completion

Navigation

Implement step-based routing
Allow back navigation
Prevent forward navigation without completing current step

Accessibility

ARIA labels for all interactive elements
Keyboard navigation support
Focus management between steps
Error announcements for screen readers

Performance

Lazy load doctor images
Virtualize long lists
Debounce search inputs
Optimize re-renders with React.memo

Sample Code Structure
tsx// App.tsx
const BookingFlow = () => {
const [currentStep, setCurrentStep] = useState(1);
const [bookingData, setBookingData] = useState({});

return (
<div className="min-h-screen bg-background">
<StickyHeader
title={getStepTitle(currentStep)}
onBack={() => setCurrentStep(prev => prev - 1)}
step={`Step ${currentStep} of 7`}
/>

      <main className="pb-20">
        {currentStep === 1 && <DepartmentSelect />}
        {currentStep === 2 && <LocationSelect />}
        {/* ... other steps */}
      </main>

      <StickyFooter>
        <Button
          onClick={() => setCurrentStep(prev => prev + 1)}
          className="w-full bg-[#c71d22]"
        >
          {getButtonText(currentStep)}
        </Button>
      </StickyFooter>
    </div>

);
};
Development Workflow

Set up React + Vite + TypeScript
Install and configure ShadCN UI
Create layout components (Header/Footer)
Build each step component
Implement navigation logic
Add form validation
Style with Tailwind + custom CSS
Test on mobile devices
Add loading/error states
Optimize performance
