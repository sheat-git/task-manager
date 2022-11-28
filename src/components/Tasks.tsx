import { Add, Delete, Edit } from '@mui/icons-material';
import {
  IconButton,
  Modal,
  Stack
} from '@mui/material';
import Paper from '@mui/material/Paper';
import { 
  DataGrid,
  getGridDateOperators,
  getGridNumericOperators,
  getGridStringOperators,
  GridFilterItem,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton
} from '@mui/x-data-grid';
import {
  GridColDef,
  GridValueSetterParams,
  GridSortModel,
  GridFilterModel
} from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { supabase } from "../supabase/client";
import { Database } from '../supabase/types';
import TaskEditor from './TaskEditor';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskCol extends GridColDef {
  field: keyof Task | 'buttons';
}

const toDate = (params: GridValueSetterParams<Date, string|null>): Date|null => {
  if (!params.value) {
    return null;
  }
  return new Date(params.value + 'Z');
};

const unNullableStringOperators = getGridStringOperators().filter(op => {
  switch (op.value) {
    case 'contains':
    case 'equals':
      return true;
    default:
      return false;
  }
});

const datetimeOperators = getGridDateOperators(true).filter(op => {
  switch (op.value) {
    case 'is':
    case 'not':
    case 'onOrAfter':
    case 'onOrBefore':
      return false;
    default:
      return true;
  }
})

const unNullableDatetimeOperators = datetimeOperators.filter(op => {
  switch (op.value) {
    case 'isEmpty':
    case 'isNotEmpty':
      return false;
    default:
      return true;
  }
});

const unNullableNumberOperators = getGridNumericOperators().filter(op => {
  switch (op.value) {
    case 'isEmpty':
    case 'isNotEmpty':
      return false;
    default:
      return true;
  }
});

const columns: TaskCol[] = [
  {
    field: 'done',
    headerName: '完了済',
    hideable: false,
    flex: 0.5,
    type: 'boolean'
  },
  {
    field: 'title',
    headerName: 'タイトル',
    hideable: false,
    flex: 1,
    filterOperators: unNullableStringOperators
  },
  {
    field: 'expired_at',
    headerName: '期限',
    flex: 1,
    type: 'dateTime',
    valueGetter: toDate,
    filterOperators: datetimeOperators
  },
  {
    field: 'created_at',
    headerName: '作成',
    flex: 1,
    type: 'dateTime',
    valueGetter: toDate,
    filterOperators: unNullableDatetimeOperators
  },
  {
    field: 'modified_at',
    headerName: '編集',
    flex: 1,
    type: 'dateTime',
    valueGetter: toDate,
    filterOperators: unNullableDatetimeOperators
  },
  {
    field: 'finished_at',
    headerName: '完了',
    flex: 1,
    type: 'dateTime',
    valueGetter: toDate,
    filterOperators: datetimeOperators
  },
  {
    field: 'priority',
    headerName: '優先度',
    flex: 0.5,
    type: 'number',
    filterOperators: unNullableNumberOperators
  }
];

interface SortRule {
  column: keyof Task;
  ascending: boolean;
}

interface FilterRule {
  column: keyof Task;
  operator: string;
  value: string|null;
}

const buildToolBar = (onClickAdd: () => void) => {
  function ToolBar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <div style={{ flexGrow: 1 }}></div>
        <IconButton aria-label='new task' color='primary' onClick={onClickAdd}>
          <Add />
        </IconButton>
      </GridToolbarContainer>
    );
  }
  return ToolBar;
};

function EditCell(
  {task, onClickEdit, fetch}: {task: Task, onClickEdit: (task: Task) => void, fetch: () => void}
) {
  const deleteTask = async () => {
    const {error} = await supabase.from('tasks').delete().eq('id', task.id);
    if (error) {
      alert(error.message);
    } else {
      fetch();
    }
  };
  return (
    <Stack direction='row'>
      <IconButton
        onClick={() => onClickEdit(task)}
        color='primary'
      >
        <Edit />
      </IconButton>
      <IconButton
        onClick={deleteTask}
        color='error'
      >
        <Delete />
      </IconButton>
    </Stack>
  );
}

export default function Tasks() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [task, setTask] = useState<Task|null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [rowCountWillChange, setRowCountWillChange] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortRule, setSortRule] = useState<SortRule|null>(null);
  const [filterRule, setFilterRule] = useState<FilterRule|null>(null);

  const fetch = async () => {
    let query = supabase.from('tasks').select('*');
    if (filterRule) {
      query = query.filter(filterRule.column, filterRule.operator, filterRule.value);
    }
    if (sortRule) {
      query = query.order(sortRule.column, {ascending: sortRule.ascending});
    }
    const { data, error } = await query.range(pageSize*page, pageSize*(page+1)-1);
    if (error) {
      alert(error.message);
      console.log(error.details);
    } else {
      setTasks(data);
    }
  };

  const fetchCount = async () => {
    let query = supabase.from('tasks').select("*", { count: "exact", head: true });
    if (filterRule) {
      query = query.filter(filterRule.column, filterRule.operator, filterRule.value);
    }
    const { error, count } = await query;
    if (error) {
      alert(error.message);
      console.log(error.details);
    } else {
      setRowCount(count ?? 0);
    }
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    setIsLoading(true);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    setIsLoading(true);
  };

  const handleSortModelChange = (sortModel: GridSortModel) => {
    if (sortModel.length) {
      const sortItem = sortModel[0];
      setSortRule({column: sortItem.field as keyof Task, ascending: (sortItem.sort === 'asc')});
    } else {
      setSortRule(null);
    }
    setIsLoading(true);
  };

  const covnertFilter = (column: keyof Task, item: GridFilterItem): [string|null, string|null] => {
    if (!item.operatorValue) return [null, null];
    try {
      switch (column) {
        case 'done':
          switch (item.value) {
            case 'true':
            case 'false':
              return ['is', item.value];
            default:
              throw new Error('unknown value');
          }
        case 'title':
          switch (item.operatorValue) {
            case 'contains':
              return ['plfts', item.value ?? ""];
            case 'equals':
              return ['eq', item.value ?? ""];
            default:
              throw new Error('unknown operator');
          }
        case 'expired_at':
        // @ts-expect-error
        case 'finished_at':
          switch (item.operatorValue) {
            case 'isEmpty':
              return ['is', null];
            case 'isNotEmpty':
              return ['not.is', null];
          }
        case 'created_at':
        case 'modified_at':
          const value = new Date(item.value).toISOString();
          switch (item.operatorValue) {
            case 'after':
              return ['gt', value];
            case 'before':
              return ['lt', value];
            default:
              throw new Error('unkonow operator');
          }
        case 'priority':
          if (!item.value || item.value === "") throw new Error('unknown value');
          switch (item.operatorValue) {
            case '=':
              return ['is', item.value];
            case '!=':
              return ['not.is', item.value];
            case '>':
              return ['gt', item.value];
            case '>=':
              return ['gte', item.value];
            case '<':
              return ['lt', item.value];
            case '<=':
              return ['lte', item.value];
            case 'isAnyOf':
              return ['in', item.value];
            default:
              throw new Error('unknown operator');
          }
        default:
          throw new Error('unknown field');
      }
    } catch {
      return [null, null];
    }
  };

  const handleFilterModelChange = (filterModel: GridFilterModel) => {
    if (filterModel.items.length) {
      const filterItem = filterModel.items[0];
      const column = filterItem.columnField as keyof Task;
      const [operator, value] = covnertFilter(column, filterItem);
      if (operator && value !== undefined) setFilterRule({column: column, operator: operator, value: value});
      else setFilterRule(null);
    } else {
      setFilterRule(null);
    }
    setRowCountWillChange(true);
    setIsLoading(true);
  };

  useEffect(() => {
    if (!isLoading) { return; }
    (async () => {
      await Promise.all([
        (async () => {
          if (rowCountWillChange) { await fetchCount(); }
        })(),
        fetch()
      ]);
      setIsLoading(false);
    })();
  }, [isLoading]);

  return (
    <Paper
      elevation={3}
      style={{
        width: '90%',
        maxWidth: '1200px',
        boxSizing: 'border-box',
        margin: '10px auto'
      }}
    >
      <Modal
        open={showModal}
        onClose={() => {setShowModal(false);}}
      >
        <TaskEditor
          task={task}
          onDone={() => {
            setTask(null);
            setShowModal(false);
            setRowCountWillChange(true);
            setIsLoading(true);
          }}
        />
      </Modal>
      <DataGrid
        autoHeight
        columns={
          columns.concat([{
            field: 'buttons',
            headerName: '編集',
            headerAlign: 'center',
            flex: 0.5,
            sortable: false,
            filterable: false,
            renderCell: params => <EditCell
              task={params.row}
              onClickEdit={(task: Task) => {
                setShowModal(true);
                setTask(task);
              }}
              fetch={() => {
                setRowCountWillChange(true);
                setIsLoading(true);
              }}
            />,
            align: 'center'
          }])
        }
        rows={tasks}
        disableSelectionOnClick
        pagination
        paginationMode='server'
        rowCount={rowCount}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        sortingMode='server'
        onSortModelChange={handleSortModelChange}
        filterMode='server'
        onFilterModelChange={handleFilterModelChange}
        components={{
          Toolbar: buildToolBar(() => {
            setShowModal(true);
            setTask(null);
          })
        }}
        initialState={{
          columns: {
            columnVisibilityModel: {
              created_at: false,
              modified_at: false,
              finished_at: false
            }
          }
        }}
        sx={{
          border: 'none'
        }}
      />
    </Paper>
  );
}
