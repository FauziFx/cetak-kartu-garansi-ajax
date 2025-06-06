const API = config.URL_API;
const urlParams = new URLSearchParams(window.location.search);
const querySearch = urlParams.get("search") || "";
const opticId = urlParams.get("opticId") || "";
load_data(1, 10, querySearch, opticId);
$("#search_box").val(querySearch);
$("#opticId").val(opticId);

var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
var yyyy = today.getFullYear();

today = yyyy + "-" + mm + "-" + dd;
const modalTambah = document.getElementById("modalTambah");
modalTambah.addEventListener("shown.bs.modal", (event) => {
  $("#optik_id").focus();
});

const bsModalTambah = new bootstrap.Modal("#modalTambah");
const bsModalPreview = new bootstrap.Modal("#modalPreview");
const bsModalEdit = new bootstrap.Modal("#modalEdit");

const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

$("#tanggal").val(today);

//   Load data Search
$("#search_box").keyup(function () {
  var query = $("#search_box").val();
  const urlParams = new URLSearchParams(window.location.search);
  const opticId = urlParams.get("opticId") || "";
  modifyUrl("search", `?search=${query}&opticId=${opticId}`);
  load_data(1, 10, query, opticId);
});

$("#opticId").change(function () {
  var opticId = $(this).val();
  const urlParams = new URLSearchParams(window.location.search);
  const myParam = urlParams.get("search") || "";
  modifyUrl("search", `?search=${myParam}&opticId=${opticId}`);
  load_data(1, 10, myParam, opticId);
});

function statusHandler(expireDate) {
  const today = moment();
  return today.isBefore(moment(expireDate)) ? "Active" : "Expired";
}

// btn Print
$(document).on("click", ".btn-print", function () {
  var id = $(this).attr("id");
  window.open(
    "print/" + id,
    "",
    "postwindow directories=0,titlebar=0,toolbar=0,location=0,status=0,menubar=0,scrollbars=no,resizable=no, width=960,height=480"
  );
});

// Submit Update
$("#formEdit").on("submit", function (e) {
  e.preventDefault();
  const id = $("#edit-id").val();
  const tanggal = $("#edit-tanggal").val();
  const nama = $("#edit-nama").val();
  const frame = $("#edit-frame").val();
  const lensa = $("#edit-lensa").val();
  const rsph = $("#edit-rsph").val();
  const rcyl = $("#edit-rcyl").val();
  const raxis = $("#edit-raxis").val();
  const radd = $("#edit-radd").val();
  const rmpd = $("#edit-rmpd").val();
  const lsph = $("#edit-lsph").val();
  const lcyl = $("#edit-lcyl").val();
  const laxis = $("#edit-laxis").val();
  const ladd = $("#edit-ladd").val();
  const lmpd = $("#edit-lmpd").val();
  const garansi_lensa = $("#edit-garansi_lensa").val();
  const garansi_frame = $("#edit-garansi_frame").val();
  const optik_id = $("#edit-optik_id").val();

  const r = [rsph, rcyl, raxis, radd, rmpd].join("/");
  const l = [lsph, lcyl, laxis, ladd, lmpd].join("/");

  const dateNow = tanggal;
  const expiredLensa =
    garansi_lensa === "-"
      ? dateNow
      : garansi_lensa === "6"
      ? moment.utc(dateNow).add("6", "M").format("YYYY-MM-DD")
      : moment.utc(dateNow).add(garansi_lensa, "y").format("YYYY-MM-DD");

  const expiredFrame =
    garansi_frame === "-"
      ? dateNow
      : garansi_frame === "6"
      ? moment.utc(dateNow).add("6", "M").format("YYYY-MM-DD")
      : moment.utc(dateNow).add(garansi_frame, "y").format("YYYY-MM-DD");

  $.ajax({
    url: API + "/warranty/" + id,
    type: "patch",
    data: JSON.stringify({
      name: nama,
      frame: frame,
      lens: lensa,
      od: r,
      os: l,
      warranty_lens: garansi_lensa,
      warranty_frame: garansi_frame,
      expire_lens: new Date(expiredLensa),
      expire_frame: new Date(expiredFrame),
      opticId: optik_id,
      createdAt: new Date(tanggal),
    }),
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      $.LoadingOverlay("hide");
      bsModalEdit.hide();
      $("#formEdit")[0].reset();
      load_data(1, 10);
    },
    complete: function () {
      $.LoadingOverlay("hide");
      Toast.fire({
        icon: "success",
        title: "Data berhasil Disimpan!",
      });
    },
  });
});

// btn Edit
$(document).on("click", ".btn-edit", function () {
  bsModalEdit.show();
  var id = $(this).attr("id");
  $.LoadingOverlay("show");

  $.ajax({
    url: API + "/warranty/" + id,
    type: "get",
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      const datas = data.data;
      const tanggal = moment
        .tz(datas.createdAt, "Asia/Jakarta")
        .format("YYYY-MM-DD");
      $("#edit-id").val(datas.id);
      $("#edit-tanggal").val(tanggal);
      $("#edit-nama").val(datas.name);
      $("#edit-frame").val(datas.frame);
      $("#edit-lensa").val(datas.lens);
      $("#edit-optik_id").val(datas.opticId).change();
      $("#edit-garansi_lensa").val(datas.warranty_lens).change();
      $("#edit-garansi_frame").val(datas.warranty_frame).change();
      const od = datas.od.split("/");
      const os = datas.os.split("/");
      $("#edit-rsph").val(od[0]);
      $("#edit-rcyl").val(od[1]);
      $("#edit-raxis").val(od[2]);
      $("#edit-radd").val(od[3]);
      $("#edit-rmpd").val(od[4]);
      $("#edit-lsph").val(os[0]);
      $("#edit-lcyl").val(os[1]);
      $("#edit-laxis").val(os[2]);
      $("#edit-ladd").val(os[3]);
      $("#edit-lmpd").val(os[4]);
    },
    complete: function () {
      $.LoadingOverlay("hide");
    },
  });
});

// btn Preview
$(document).on("click", ".btn-preview", function () {
  bsModalPreview.show();
  var id = $(this).attr("id");
  $.LoadingOverlay("show");

  $.ajax({
    url: API + "/warranty/" + id,
    type: "get",
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      const datas = data.data;
      const tanggal = moment
        .tz(datas.tanggal, "Asia/Jakarta")
        .format("DD-MMMM-YYYY");

      const garansi_lensa =
        datas.warranty_lens == "-"
          ? ""
          : datas.warranty_lens === "6"
          ? datas.warranty_lens + " Bulan "
          : datas.warranty_lens + " Tahun ";

      const garansi_frame =
        datas.warranty_frame == "-"
          ? ""
          : datas.warranty_frame === "6"
          ? datas.warranty_frame + " Bulan "
          : datas.warranty_frame + " Tahun ";

      const status_garansi_lensa =
        statusHandler(datas.expire_lens) == "Active"
          ? `<span class="badge text-bg-success">Active</span>`
          : `<span class="badge text-bg-danger">Expired</span>`;
      const status_garansi_frame =
        statusHandler(datas.expire_frame) == "Active"
          ? `<span class="badge text-bg-success">Active</span>`
          : `<span class="badge text-bg-danger">Expired</span>`;

      const expired_lensa =
        datas.warranty_lens != "-"
          ? moment.tz(datas.expire_lens, "Asia/Jakarta").format("DD-MMMM-YYYY")
          : "";

      const expired_frame =
        datas.warranty_frame != "-"
          ? moment.tz(datas.expire_frame, "Asia/Jakarta").format("DD-MMMM-YYYY")
          : "";

      const od = datas.od.split("/");
      const os = datas.os.split("/");

      $("#prev-tanggal").html(tanggal);
      $("#prev-nama_optik").html(datas.optic.optic_name);
      $("#prev-nama").html(datas.name);
      $("#prev-lensa").html(datas.lens);
      $("#prev-frame").html(datas.frame);
      $("#prev-garansi_lensa").html(garansi_lensa + status_garansi_lensa);
      $("#prev-garansi_frame").html(garansi_frame + status_garansi_frame);
      $("#prev-expired_lensa").html(expired_lensa);
      $("#prev-expired_frame").html(expired_frame);
      $("#prev-rsph").html(od[0]);
      $("#prev-rcyl").html(od[1]);
      $("#prev-raxis").html(od[2]);
      $("#prev-radd").html(od[3]);
      $("#prev-rmpd").html(od[4]);
      $("#prev-lsph").html(os[0]);
      $("#prev-lcyl").html(os[1]);
      $("#prev-laxis").html(os[2]);
      $("#prev-ladd").html(os[3]);
      $("#prev-lmpd").html(os[4]);
    },
    complete: function () {
      $.LoadingOverlay("hide");
    },
  });
});

// btn hapus
$(document).on("click", ".btn-hapus", function () {
  var id = $(this).attr("id");
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.LoadingOverlay("show");
      $.ajax({
        url: API + "/warranty/" + id,
        type: "delete",
        success: function (data) {
          load_data(1, 10);
        },
        complete: function () {
          $.LoadingOverlay("hide");
          Toast.fire({
            icon: "success",
            title: "Data berhasil Dihapus!",
          });
        },
      });
    }
  });
});

// Submit data
$("#formTambah").on("submit", function (e) {
  e.preventDefault();
  $.LoadingOverlay("show");

  let nama = $("#nama").val();
  let frame = $("#frame").val();
  let lensa = $("#lensa").val();
  let rsph = $("#rsph").val();
  let rcyl = $("#rcyl").val();
  let raxis = $("#raxis").val();
  let radd = $("#radd").val();
  let rmpd = $("#rmpd").val();
  let lsph = $("#lsph").val();
  let lcyl = $("#lcyl").val();
  let laxis = $("#laxis").val();
  let ladd = $("#ladd").val();
  let lmpd = $("#lmpd").val();
  let garansi_lensa = $("#garansi_lensa").val();
  let garansi_frame = $("#garansi_frame").val();
  let optik_id = $("#optik_id").val();
  let tanggal = $("#tanggal").val();

  const r = [rsph, rcyl, raxis, radd, rmpd].join("/");
  const l = [lsph, lcyl, laxis, ladd, lmpd].join("/");
  const dateNow = tanggal;
  const expiredLensa =
    garansi_lensa === "-"
      ? dateNow
      : garansi_lensa === "6"
      ? moment.utc(dateNow).add("6", "M").format("YYYY-MM-DD")
      : moment.utc(dateNow).add(garansi_lensa, "y").format("YYYY-MM-DD");

  const expiredFrame =
    garansi_frame === "-"
      ? dateNow
      : garansi_frame === "6"
      ? moment.utc(dateNow).add("6", "M").format("YYYY-MM-DD")
      : moment.utc(dateNow).add(garansi_frame, "y").format("YYYY-MM-DD");

  $.ajax({
    url: API + "/warranty",
    type: "post",
    data: JSON.stringify({
      name: nama,
      frame: frame,
      lens: lensa,
      od: r,
      os: l,
      warranty_lens: garansi_lensa,
      warranty_frame: garansi_frame,
      expire_lens: expiredLensa + getCurrentTime(),
      expire_frame: expiredFrame + getCurrentTime(),
      createdAt: dateNow + getCurrentTime(),
      opticId: optik_id,
    }),
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      $.LoadingOverlay("hide");
      $("#formTambah")[0].reset();
      $("#tanggal").val(today);
      bsModalTambah.hide();

      load_data(1, 10);
    },
    complete: function () {
      $.LoadingOverlay("hide");
      Toast.fire({
        icon: "success",
        title: "Data berhasil Disimpan!",
      });
    },
  });
});

// Load
function load_data(page, limit, name, opticId) {
  $.ajax({
    url:
      API +
      "/warranty?" +
      $.param({ page: page, limit: limit, name: name, opticId: opticId }),
    type: "get",
    data: JSON.stringify({ type: "fetch" }),
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      var html = "";
      var pagination = "";
      if (data.data.length > 0) {
        for (var count = 0; count < data.data.length; count++) {
          html +=
            `
                <tr>
                    <td>` +
            moment(data.data[count].createdAt)
              .tz("Asia/Jakarta")
              .format("DD/MM/YYYY") +
            `</td>
                    <td>` +
            data.data[count].optic.optic_name +
            `</td>
                    <td>` +
            data.data[count].name.toUpperCase() +
            `</td>
                    <td>` +
            data.data[count].frame.toUpperCase() +
            `</td>
                    <td style="max-width: 15ch;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">` +
            data.data[count].lens.toUpperCase() +
            `</td>
                    <td>
                      <button id="` +
            data.data[count].id +
            `" type="button" class="btn btn-info btn-xs btn-preview" data-bs-toggle="tooltip" data-bs-title="Preview">
                    <i class="fas fa-eye text-white"></i>
                </button>
                <button id="` +
            data.data[count].id +
            `" type="button" class="btn btn-primary btn-xs btn-print" data-bs-toggle="tooltip" data-bs-title="Print Invoice">
                    <i class="fas fa-print"></i>
                </button>
                <button id="` +
            data.data[count].id +
            `" type="button" class="btn btn-success btn-xs btn-edit" data-bs-toggle="tooltip" data-bs-title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button id="` +
            data.data[count].id +
            `" type="button" class="btn btn-danger btn-xs btn-hapus" data-bs-toggle="tooltip" data-bs-title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
                </td>`;
        }
      }

      if (data.totalPages > 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get("search") || "";
        const opticId = urlParams.get("opticId") || "";
        pagination += `
        <nav aria-label="Page navigation example">
          <ul class="pagination mb-1">
            <li class="page-item ${
              data.currentPage == 1 && "disabled"
            }"><a class="page-link" href="javascript:void(0)" onClick="load_data(${
          data.currentPage - 1
        },10,'${myParam}',${opticId})">Previous</a></li>
            <li class="page-item"><a class="page-link">${
              data.currentPage
            }</a></li>
            <li class="page-item ${
              data.currentPage == data.totalPages && "disabled"
            }"><a class="page-link" href="javascript:void(0)" onClick="load_data(${
          data.currentPage + 1
        },10,'${myParam}',${opticId})">Next</a></li>
          </ul>
        </nav>
        <div>Total Data : ${data.totalData}</div>
        `;
      }

      $("#sample_data tbody").html(html);
      $("#pagination").html(pagination);
    },
  });
}

function modifyUrl(title, url) {
  if (typeof history.pushState != "undefined") {
    var obj = {
      Title: title,
      Url: url,
    };
    history.pushState(obj, obj.Title, obj.Url);
  }
}

function getCurrentTime() {
  const dateObj = new Date();
  let hour = dateObj.getHours();
  hour = ("0" + hour).slice(-2);
  // To make sure the hour always has 2-character-format

  let minute = dateObj.getMinutes();
  minute = ("0" + minute).slice(-2);
  // To make sure the minute always has 2-character-format

  let second = dateObj.getSeconds();
  second = ("0" + second).slice(-2);
  // To make sure the second always has 2-character-format

  const time = ` ${hour}:${minute}:${second}`;
  return time;
}
