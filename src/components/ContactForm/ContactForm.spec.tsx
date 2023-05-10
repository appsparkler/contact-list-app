import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { ContactForm } from "./ContactForm";
import { IContactFormData } from "types";
import { contactsData } from "data";

jest.useFakeTimers();

const onSubmit = jest.fn();
const onCancel = jest.fn();
const contact: IContactFormData = contactsData.variant1[0];
const ContactFormRenderer = () => (
  <ContactForm
    onSubmit={onSubmit}
    onCancel={onCancel}
    formType={"Create"}
    TriggerButton={({ onClick }) => (
      <button onClick={onClick}>Click This</button>
    )}
    contact={contact}
  />
);

describe("ContactForm - Snapshot Tests", () => {
  it("renders correctly when modal is closed", () => {
    const { container } = render(<ContactFormRenderer />);
    expect(container).toMatchSnapshot();
  });

  it("renders correctly when modal is opened", () => {
    const { baseElement } = render(<ContactFormRenderer />);
    clickOnTriggerButton();
    expect(baseElement).toMatchSnapshot();
  });
});

afterEach(cleanup);

describe("ContactForm - Functional Tests", () => {
  it("opens Dialog when TriggerButton is clicked", () => {
    render(<ContactFormRenderer />);
    clickOnTriggerButton();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes dialog when close button is clicked", async () => {
    render(<ContactFormRenderer />);
    clickOnTriggerButton();
    clickOnCloseButton();
    act(() => {
      jest.runAllTimers();
    });
    expect(screen.queryByText(/create contact/i)).not.toBeInTheDocument();
  });

  it("closes Dialog when cancel button is clicked", () => {
    render(<ContactFormRenderer />);
    clickOnTriggerButton();
    clickOnCancelButton();
    act(() => {
      jest.runAllTimers();
    });
    expect(screen.queryByText(/create contact/i)).not.toBeInTheDocument();
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onSubmit function with form data when form is submitted", () => {
    const updatedContact: IContactFormData = {
      ...contact,
      //
      name: "Jhon Doe",
      email: "johndoe@example.com",
      company: "Google",
      address: "UK",
      mobile: "9999",
      //
    };
    render(<ContactFormRenderer />);
    clickOnTriggerButton();
    changeTextField(/Name/i, updatedContact.name);
    changeTextField(/Email/i, String(updatedContact.email));
    changeTextField(/Mobile/i, String(updatedContact.mobile));
    changeTextField(/Company/i, String(updatedContact.company));
    changeTextField(/Address/i, String(updatedContact.address));
    clickOnFirstCreateButton();
    expect(onSubmit).toHaveBeenCalledWith(updatedContact);
  });

  it("calls onCancel function when cancel button is clicked", () => {
    render(<ContactFormRenderer />);
    clickOnTriggerButton();
    clickOnCancelButton();
    expect(onCancel).toHaveBeenCalled();
  });

  //   it("validates required fields when form is submitted", () => {
  //     const { getByRole, getByLabelText, getByText } = render(
  //       <ContactForm onSubmit={onSubmit} />
  //     );
  //     fireEvent.click(getByRole("button", { name: /contact us/i }));
  //     fireEvent.click(getByRole("button", { name: /submit/i }));
  //     expect(getByText("First Name is required.")).toBeInTheDocument();
  //     expect(getByText("Last Name is required.")).toBeInTheDocument();
  //     expect(getByText("Email is required.")).toBeInTheDocument();
  //   });
});

function changeTextField(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), {
    target: { value },
  });
}

function clickOnTriggerButton() {
  fireEvent.click(screen.getByRole("button", { name: /Click This/i }));
}
function clickOnCloseButton() {
  const closeButton = screen.getByRole("button", { name: /close/i });
  fireEvent.click(closeButton);
}
function clickOnCancelButton() {
  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
}
function clickOnFirstCreateButton() {
  fireEvent.click(screen.getAllByRole("button", { name: /Create/i })[0]);
}
