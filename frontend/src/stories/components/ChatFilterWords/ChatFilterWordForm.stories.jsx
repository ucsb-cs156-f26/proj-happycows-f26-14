import React from "react";
import ChatFilterWordForm from "main/components/ChatFilterWords/ChatFilterWordForm";

export default {
  title: "components/ChatFilterWords/ChatFilterWordForm",
  component: ChatFilterWordForm,
};

const Template = (args) => <ChatFilterWordForm {...args} />;

export const Default = Template.bind({});
Default.args = {
  submitAction: (data, clearInput) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
    clearInput();
  },
};
