import Swal from "sweetalert2";

export const ConfirmAlert = async ()=>{
    let confirmReturn = false;
    await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        confirmReturn = result.isConfirmed;
    });
    return confirmReturn;
}

export const DeleteAlert = async ()=>{
    await Swal.fire({
        title: "Deleted!",
        text: "Deleted Successfully",
        icon: "success"
    });
}