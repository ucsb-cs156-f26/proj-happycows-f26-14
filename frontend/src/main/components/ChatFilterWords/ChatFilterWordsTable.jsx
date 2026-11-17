import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/chatFilterWordUtils";

export default function ChatFilterWordsTable({
  words,
  testid = "ChatFilterWordsTable",
}) {
  const [showModal, setShowModal] = useState(false);
  const [cellToDelete, setCellToDelete] = useState(null);

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/chatfilterwords/all"],
  );

  const deleteCallback = (cell) => {
    setCellToDelete(cell);
    setShowModal(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(cellToDelete);
    setShowModal(false);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id",
    },
    {
      Header: "Word",
      accessor: "word",
    },
    ButtonColumn("Delete", "danger", deleteCallback, testid),
  ];

  return (
    <>
      <OurTable data={words} columns={columns} testid={testid} />
      <Modal
        data-testid={`${testid}-Modal`}
        show={showModal}
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove &quot;
          {cellToDelete?.row.values.word}&quot; from the filter list?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            data-testid={`${testid}-Modal-Cancel`}
            onClick={() => setShowModal(false)}
          >
            Keep this Word
          </Button>
          <Button
            variant="danger"
            data-testid={`${testid}-Modal-Delete`}
            onClick={confirmDelete}
          >
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
