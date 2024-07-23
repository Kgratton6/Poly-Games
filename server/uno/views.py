from uno.models import TableManager
from django.http import JsonResponse

tableManager = TableManager()

def create_table(request):
    table = tableManager.createTable()
    return JsonResponse(table.tableId, safe=False, status=200)

def get_tables(request):
    tables = [table.getGameInfo() for key, table in tableManager.tables.items()]
    return JsonResponse(tables, safe=False, status=200)
