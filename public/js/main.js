$(() => {
    if ($('textarea#ta').length) {
        CKEDITOR.replace('ta')
    }

    // nếu ko xác nhận xóa sẽ hủy thao tác Xóa
    $('a.confirmDeletion').on('click', () => {
        if (!confirm('Confirm deletion')) return false
    })

})