import { toast } from "react-toastify";

export function onDeleteSuccess(response) {
  toast(response.message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/chatfilterwords",
    method: "DELETE",
    params: {
      id: cell.row.values.id,
    },
  };
}

export function wordToAxiosParamsPost(data) {
  return {
    url: "/api/chatfilterwords",
    method: "POST",
    params: {
      word: data.word,
    },
  };
}

export function onPostSuccess(saved) {
  toast(`"${saved.word}" was added to the filter list`);
}
